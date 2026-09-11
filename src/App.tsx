import { useState } from "react";
import { TabName } from "@/components/Navegacao";
import { Ocorrencia, ocorrenciasIniciais } from "@/data/ocorrencias";
import Login from "@/screens/Login";
import Inicio from "@/screens/Inicio";
import Mapa from "@/screens/Mapa";
import NovaOcorrencia from "@/screens/NovaOcorrencia";
import Atividade from "@/screens/Atividade";
import Perfil from "@/screens/Perfil";
import Detalhe from "@/screens/Detalhe";
import Dashboard from "@/screens/Dashboard";

export type AppScreen = "login" | TabName | "detalhe" | "dashboard";

export default function App() {
  // Pilha de navegação: permite voltar para a tela anterior
  const [stack, setStack] = useState<AppScreen[]>(["login"]);
  const [activeTab, setActiveTab] = useState<TabName>("inicio");
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(ocorrenciasIniciais);
  const [ocorrenciaSelecionadaId, setOcorrenciaSelecionadaId] = useState<string>("1");

  const screen = stack[stack.length - 1];

  // Navega para uma aba (limpa a pilha)
  function navigate(tab: TabName) {
    setActiveTab(tab);
    setStack([tab]);
  }

  // Empurra uma tela sem mudar a aba ativa
  function push(s: AppScreen) {
    setStack(prev => [...prev, s]);
  }

  // Volta para a tela anterior
  function goBack() {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function openDetalhe(id: string) {
    setOcorrenciaSelecionadaId(id);
    push("detalhe");
  }

  function openDashboard() {
    push("dashboard");
  }

  function handleLogin() {
    setStack(["inicio"]);
    setActiveTab("inicio");
  }

  function confirmarOcorrencia(id: string) {
    setOcorrencias(prev =>
      prev.map(o =>
        o.id === id && !o.confirmadoPorMim
          ? { ...o, confirmacoes: o.confirmacoes + 1, confirmadoPorMim: true }
          : o
      )
    );
  }

  function registrarNovaOcorrencia(nova: Omit<Ocorrencia, "id" | "confirmadoPorMim">) {
    const id = String(Date.now());
    setOcorrencias(prev => [
      { ...nova, id, confirmadoPorMim: false },
      ...prev,
    ]);
    navigate("inicio");
  }

  const ocorrenciaSelecionada =
    ocorrencias.find(o => o.id === ocorrenciaSelecionadaId) ?? ocorrencias[0];

  const commonProps = { activeTab, onNavigate: navigate, onOpenDetalhe: openDetalhe, ocorrencias };

  return (
    <div className="size-full flex items-center justify-center bg-[#c8d8ea]"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #3b82f6 0%, #1e3a5f 60%, #0f1f33 100%)" }}>
      <div className="w-full max-w-[390px] h-full max-h-[844px] shadow-2xl overflow-hidden rounded-[28px]"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)" }}>

        {screen === "login" && <Login onLogin={handleLogin} />}

        {screen === "inicio" && (
          <Inicio {...commonProps} onOpenDashboard={openDashboard} />
        )}
        {screen === "mapa" && <Mapa {...commonProps} />}
        {screen === "nova" && (
          <NovaOcorrencia activeTab={activeTab} onNavigate={navigate} onRegistrar={registrarNovaOcorrencia} />
        )}
        {screen === "atividade" && <Atividade {...commonProps} />}
        {screen === "perfil" && <Perfil {...commonProps} />}

        {screen === "detalhe" && (
          <Detalhe
            activeTab={activeTab}
            onNavigate={navigate}
            onBack={goBack}
            ocorrencia={ocorrenciaSelecionada}
            onConfirmar={confirmarOcorrencia}
          />
        )}
        {screen === "dashboard" && (
          <Dashboard
            activeTab={activeTab}
            onNavigate={navigate}
            onBack={goBack}
            onOpenDetalhe={openDetalhe}
            ocorrencias={ocorrencias}
          />
        )}
      </div>
    </div>
  );
}
