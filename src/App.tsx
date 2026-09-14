import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from "react-router";
import Navegacao, { TabName } from "@/components/Navegacao";
import { useAuth } from "@/context/AuthContext";
import { Ocorrencia, ocorrenciasIniciais } from "@/data/ocorrencias";
import useCategorias from "@/hooks/useCategorias";
import Login from "@/screens/Login";
import Inicio from "@/screens/Inicio";
import Mapa from "@/screens/Mapa";
import NovaOcorrencia from "@/screens/NovaOcorrencia";
import Atividade from "@/screens/Atividade";
import Perfil from "@/screens/Perfil";
import Detalhe from "@/screens/Detalhe";
import Dashboard from "@/screens/Dashboard";

const tabPaths: Record<TabName, string> = {
  inicio: "/",
  mapa: "/mapa",
  nova: "/ocorrencias/nova",
  atividade: "/atividade",
  perfil: "/perfil",
};

const rotasProtegidas = new Set(["/ocorrencias/nova", "/atividade", "/perfil"]);

function rotaOrigemSegura(state: unknown): string {
  if (!state || typeof state !== "object" || !("from" in state)) return "/";

  const from = (state as { from?: unknown }).from;
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) return "/";

  const pathname = from.split(/[?#]/, 1)[0];
  return rotasProtegidas.has(pathname) ? from : "/";
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
  const categoriasState = useCategorias();
  const isLogin = useMatch("/entrar") !== null;
  const detalheMatch = useMatch("/ocorrencias/:id");
  const [{ ocorrencias, confirmadas }, setEstado] = useState<{
    ocorrencias: Ocorrencia[];
    confirmadas: string[];
  }>({ ocorrencias: ocorrenciasIniciais, confirmadas: [] });
  const navigationState = location.state as { from?: string; activeTab?: TabName; registroConcluido?: boolean } | null;
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const activeTab: TabName =
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

  function confirmarOcorrencia(id: string) {
    setEstado(prev => {
      if (prev.confirmadas.includes(id) || !prev.ocorrencias.some(o => o.id === id)) return prev;
      return {
        ocorrencias: prev.ocorrencias.map(o => o.id === id
          ? { ...o, quantidadeConfirmacoes: o.quantidadeConfirmacoes + 1 } : o),
        confirmadas: [...prev.confirmadas, id],
      };
    });
  }

  function registrarNovaOcorrencia(nova: Omit<Ocorrencia, "id">) {
    const id = String(Date.now());
    setEstado(prev => ({ ...prev, ocorrencias: [{ ...nova, id }, ...prev.ocorrencias] }));
    return id;
  }

  const ocorrenciaSelecionada =
    ocorrencias.find(o => o.id === detalheMatch?.params.id);

  const commonProps = {
    activeTab,
    onNavigate: navigate,
    onOpenDetalhe: openDetalhe,
    ocorrencias,
    ...categoriasState,
  };

  return (
    <div className={`app-shell ${isLogin ? "app-shell--login" : ""}`}>
      {!isLogin && (
        <aside className="desktop-navigation">
          <p className="desktop-brand">Paracatu360</p>
          <p className="desktop-city">Paracatu, Minas Gerais</p>
          <Navegacao activeTab={activeTab} onNavigate={navigate} />
        </aside>
      )}
      <main className="app-main">

        <Routes>
          <Route path="/entrar" element={<RotaLogin />} />
          <Route path="/" element={<Inicio {...commonProps} onOpenDashboard={openDashboard} ordemInicial={navigationState?.registroConcluido ? "recente" : "relevancia"} />} />
          <Route path="/mapa" element={<Mapa {...commonProps} />} />
          <Route path="/ocorrencias/nova" element={
            <RotaProtegida>
              <NovaOcorrencia key={location.key} activeTab={activeTab} onNavigate={navigate}
                onRegistrar={registrarNovaOcorrencia} onOpenDetalhe={openDetalhe}
                onVoltarInicio={() => navigateTo("/", { state: { registroConcluido: true } })}
                {...categoriasState} />
            </RotaProtegida>
          } />
          <Route path="/atividade" element={
            <RotaProtegida>
              <Atividade {...commonProps} />
            </RotaProtegida>
          } />
          <Route path="/perfil" element={
            <RotaProtegida>
              <Perfil {...commonProps} confirmadas={confirmadas} />
            </RotaProtegida>
          } />
          <Route path="/ocorrencias/:id" element={ocorrenciaSelecionada ? (
            <Detalhe
              activeTab={activeTab}
              onNavigate={navigate}
              onBack={goBack}
              ocorrencia={ocorrenciaSelecionada}
              confirmadoPorMim={confirmadas.includes(ocorrenciaSelecionada.id)}
              onConfirmar={confirmarOcorrencia}
              {...categoriasState}
            />
          ) : <Navigate to="/" replace />} />
          <Route path="/indicadores" element={
            <Dashboard
              activeTab={activeTab}
              onNavigate={navigate}
              onBack={goBack}
              onOpenDetalhe={openDetalhe}
              ocorrencias={ocorrencias}
              {...categoriasState}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
