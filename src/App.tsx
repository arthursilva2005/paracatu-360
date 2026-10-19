import { lazy, Suspense, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useMatch, useNavigate } from "react-router";
import Navegacao, { TabName } from "@/components/Navegacao";
import { useAuth } from "@/context/AuthContext";
import useCategorias from "@/hooks/useCategorias";
import {
  ErroEnvioFotos,
  RegistroIncompletoError,
  enviarFotosOcorrencia,
  validarFotos,
} from "@/lib/fotosOcorrencias";
import { criarOcorrencia, ehUuidOcorrencia, type DadosCriacaoOcorrencia } from "@/lib/ocorrencias";
import { supabase } from "@/lib/supabase";
import Login from "@/screens/Login";
import Inicio from "@/screens/Inicio";
import NovaOcorrencia from "@/screens/NovaOcorrencia";
import Atividade from "@/screens/Atividade";
import Perfil from "@/screens/Perfil";
import Detalhe from "@/screens/Detalhe";

const RecuperarSenha = lazy(() => import("@/screens/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("@/screens/RedefinirSenha"));
const Mapa = lazy(() => import("@/screens/Mapa"));
const Dashboard = lazy(() => import("@/screens/Dashboard"));
const Moderacao = lazy(() => import("@/screens/Moderacao"));
const Sobre = lazy(() => import("@/screens/Sobre"));

const tabPaths: Record<TabName, string> = {
  inicio: "/",
  mapa: "/mapa",
  nova: "/ocorrencias/nova",
  atividade: "/atividade",
  perfil: "/perfil",
  moderacao: "/moderacao",
};

const rotasProtegidas = new Set(["/ocorrencias/nova", "/atividade", "/perfil", "/moderacao"]);

function rotaOrigemSegura(state: unknown): string {
  if (!state || typeof state !== "object" || !("from" in state)) return "/";

  const from = (state as { from?: unknown }).from;
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(from)) return "/";

  const pathname = from.split(/[?#]/, 1)[0];
  const detalhe = pathname.match(/^\/ocorrencias\/([^/]+)$/);
  const detalheModeracao = pathname.match(/^\/moderacao\/([^/]+)$/);
  return rotasProtegidas.has(pathname) ||
    (detalhe && ehUuidOcorrencia(detalhe[1])) ||
    (detalheModeracao && ehUuidOcorrencia(detalheModeracao[1])) ? from : "/";
}

function RotaProtegida({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-screen bg-[#f3f6fa]" aria-busy="true" />;
  }

  if (!session) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/entrar" replace state={{ from }} />;
  }

  return children;
}

function RotaEquipe({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="app-screen bg-[#f3f6fa]" aria-busy="true" />;
  if (!session) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  if (profile?.papel !== "moderador" && profile?.papel !== "administrador") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RotaLogin() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-screen bg-[#f3f6fa]" aria-busy="true" />;
  }

  if (session) {
    return <Navigate to={rotaOrigemSegura(location.state)} replace />;
  }

  return <Login />;
}

export default function App() {
  const navigateTo = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const categoriasState = useCategorias();
  const isAuthScreen = ["/entrar", "/recuperar-senha", "/redefinir-senha"].includes(location.pathname);
  const detalheMatch = useMatch("/ocorrencias/:id");
  const moderacaoMatch = useMatch("/moderacao/:id");
  const navigationState = location.state as { from?: string; activeTab?: TabName; registroConcluido?: boolean } | null;
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const activeTab: TabName =
    pathname.startsWith("/moderacao/") ? "moderacao" :
    (Object.keys(tabPaths) as TabName[]).find(tab => tabPaths[tab] === pathname) ??
    (navigationState?.activeTab && Object.prototype.hasOwnProperty.call(tabPaths, navigationState.activeTab)
      ? navigationState.activeTab
      : "inicio");

  function navigate(tab: TabName) {
    navigateTo(tabPaths[tab], { replace: pathname === tabPaths[tab] });
  }

  // Volta para a tela anterior
  function goBack() {
    // Acesso direto não tem uma tela anterior dentro do aplicativo.
    if (navigationState?.from) navigateTo(-1);
    else navigateTo("/", { replace: true });
  }

  function openDetalhe(id: string) {
    navigateTo(`/ocorrencias/${encodeURIComponent(id)}`, {
      state: { from: location.pathname, activeTab },
    });
  }

  function openDashboard() {
    navigateTo("/indicadores", {
      state: { from: location.pathname, activeTab },
    });
  }

  async function registrarNovaOcorrencia(
    dados: DadosCriacaoOcorrencia,
    arquivos: readonly File[],
    onEnviandoFotos: () => void,
  ): Promise<string> {
    if (!user) {
      throw new Error("Sessão de usuário não encontrada.");
    }

    validarFotos(arquivos);
    const novaOcorrencia = await criarOcorrencia(dados, user.id);
    try {
      onEnviandoFotos();
      await enviarFotosOcorrencia(novaOcorrencia.id, arquivos);
    } catch (error) {
      let ocorrenciaRemovida = false;
      if (error instanceof ErroEnvioFotos && error.limpeza.objetosRemovidos) {
        try {
          const { data, error: erroExclusao } = await supabase
            .from("ocorrencias")
            .delete()
            .eq("id", novaOcorrencia.id)
            .select("id")
            .maybeSingle();
          ocorrenciaRemovida = !erroExclusao && data?.id === novaOcorrencia.id;
        } catch (erroExclusao) {
          console.error("Não foi possível remover a ocorrência incompleta.", erroExclusao);
        }
      }

      if (!ocorrenciaRemovida) {
        console.error("A ocorrência pode precisar de limpeza manual.", novaOcorrencia.id, error);
        throw new RegistroIncompletoError(novaOcorrencia.id);
      }
      throw error;
    }

    return novaOcorrencia.id;
  }

  const detalheId = detalheMatch?.params.id ?? "";

  return (
    <div className={`app-shell ${isAuthScreen ? "app-shell--login" : ""}`}>
      {!isAuthScreen && (
        <aside className="desktop-navigation">
          <div className="desktop-identity">
            <img src={`${import.meta.env.BASE_URL}logoptu360.jpg`} alt="" className="desktop-logo" />
            <div>
              <p className="desktop-brand">Paracatu 360</p>
              <p className="desktop-city">Paracatu, Minas Gerais</p>
            </div>
          </div>
          <Navegacao activeTab={pathname === "/sobre" ? null : activeTab} onNavigate={navigate} />
          <div className="desktop-institutional">
            <Link to="/sobre" aria-current={pathname === "/sobre" ? "page" : undefined}
              className="desktop-about-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Sobre o Paracatu 360</span>
            </Link>
            <p className="desktop-institutional-tagline">Veja. Registre. Acompanhe.</p>
          </div>
        </aside>
      )}
      <main className="app-main">
        <Suspense fallback={<div className="app-screen bg-[#f3f6fa] flex items-center justify-center" role="status" aria-live="polite">Carregando...</div>}>
        <Routes>
          <Route path="/entrar" element={<RotaLogin />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/sobre" element={<Sobre activeTab={null} onNavigate={navigate} />} />
          <Route path="/" element={<Inicio activeTab={activeTab} onNavigate={navigate}
            onOpenDetalhe={openDetalhe}
            {...categoriasState} onOpenDashboard={openDashboard}
            ordemInicial={navigationState?.registroConcluido ? "recente" : "relevancia"} />} />
          <Route path="/mapa" element={<Mapa activeTab={activeTab} onNavigate={navigate}
            onOpenDetalhe={openDetalhe} {...categoriasState} />} />
          <Route path="/ocorrencias/nova" element={
            <RotaProtegida>
              <NovaOcorrencia activeTab={activeTab} onNavigate={navigate}
                onRegistrar={registrarNovaOcorrencia} onOpenDetalhe={openDetalhe}
                onVoltarInicio={() => navigateTo("/", { state: { registroConcluido: true } })}
                {...categoriasState} />
            </RotaProtegida>
          } />
          <Route path="/atividade" element={
            <RotaProtegida>
              <Atividade activeTab={activeTab} onNavigate={navigate} onOpenDetalhe={openDetalhe} {...categoriasState} />
            </RotaProtegida>
          } />
          <Route path="/perfil" element={
            <RotaProtegida>
              <Perfil activeTab={activeTab} onNavigate={navigate} onOpenDetalhe={openDetalhe} {...categoriasState} />
            </RotaProtegida>
          } />
          <Route path="/ocorrencias/:id" element={
            <Detalhe
              key={detalheId}
              id={detalheId}
              activeTab={activeTab}
              onNavigate={navigate}
              onBack={goBack}
              {...categoriasState}
            />
          } />
          <Route path="/moderacao" element={
            <RotaEquipe>
              <Moderacao activeTab={activeTab} onNavigate={navigate}
                onOpenDetalhe={id => navigateTo(`/moderacao/${encodeURIComponent(id)}`)}
                {...categoriasState} />
            </RotaEquipe>
          } />
          <Route path="/moderacao/:id" element={
            <RotaEquipe>
              <Moderacao key={moderacaoMatch?.params.id} id={moderacaoMatch?.params.id}
                activeTab={activeTab} onNavigate={navigate}
                onOpenDetalhe={id => navigateTo(`/moderacao/${encodeURIComponent(id)}`)}
                {...categoriasState} />
            </RotaEquipe>
          } />
          <Route path="/indicadores" element={
            <Dashboard
              activeTab={activeTab}
              onNavigate={navigate}
              onBack={goBack}
              {...categoriasState}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>
    </div>
  );
}
