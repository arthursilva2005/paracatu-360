import { useEffect, useMemo, useState } from "react";
import { EstadoCategorias } from "@/hooks/useCategorias";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import FiltroCategorias from "@/components/FiltroCategorias";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";
import { useAuth } from "@/context/AuthContext";
import { listarOcorrenciasPublicas, type OcorrenciaHome } from "@/lib/ocorrencias";
import { calcularIndicadoresDashboard } from "@/lib/indicadores";

type Props = EstadoCategorias & {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
  onOpenDashboard: () => void;
  ordemInicial?: Ordem;
};

type Ordem = "relevancia" | "recente";

export default function Inicio({
  activeTab,
  onNavigate,
  onOpenDetalhe,
  onOpenDashboard,
  ordemInicial = "relevancia",
  categorias,
  categoriasLoading,
  categoriasError,
  recarregarCategorias,
}: Props) {
  const [ordem, setOrdem] = useState<Ordem>(ordemInicial);
  const [catFiltro, setCatFiltro] = useState("");
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaHome[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);
    setOcorrencias([]);

    void listarOcorrenciasPublicas().then(lista => {
      if (!ativo) return;
      setOcorrencias(lista);
    }).catch(() => {
      if (!ativo) return;
      setErro(true);
    }).finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => { ativo = false; };
  }, [user?.id, tentativa]);

  const filtradas = ocorrencias.filter(ocorrencia => {
    if (catFiltro === "") return true;
    return ocorrencia.categoriaId === catFiltro;
  });
  const ordenadas = [...filtradas].sort((a, b) =>
    ordem === "relevancia"
      ? b.quantidadeConfirmacoes - a.quantidadeConfirmacoes
      : new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  const indicadores = useMemo(
    () => calcularIndicadoresDashboard(ocorrencias, categorias),
    [ocorrencias, categorias],
  );

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content layout-inicio flex flex-col gap-[20px] items-start pb-[16px] pt-[22px] px-[22px] w-full">

          {/* Hero */}
          <div className="home-hero bg-[#075ce5] relative rounded-[20px] w-full overflow-hidden">
            <div className="flex flex-col gap-[12px] p-[24px]">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[10px] text-white/70 tracking-widest">A CIDADE PELOS SEUS OLHOS</p>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[26px] text-white leading-snug">Uma cidade melhor começa com você.</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[13px] text-white/80">Registre um problema e acompanhe cada atualização.</p>
              <button
                onClick={() => onNavigate("nova")}
                className="bg-[#ffcc36] hover:bg-[#f0bb20] active:scale-[0.98] w-full rounded-[14px] py-[14px] border-none outline-none cursor-pointer transition-all mt-[4px]"
              >
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Registrar problema</p>
              </button>
            </div>
          </div>

          {/* Dashboard 360 entry */}
          <button
            onClick={onOpenDashboard}
            className="home-dashboard w-full bg-[#10284a] rounded-[16px] border-none outline-none cursor-pointer active:opacity-90 transition-opacity overflow-hidden"
          >
            <div className="flex items-center justify-between px-[18px] py-[14px] lg:block lg:px-[20px] lg:py-[18px]">
              <div className="flex items-center gap-[12px] lg:flex-col lg:items-start lg:gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#ffcc36] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      stroke="#10284a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[14px]">Indicadores da cidade</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-white/60 text-[11px] lg:hidden">
                    {carregando ? "Carregando ocorrências..." : erro ? "Ocorrências indisponíveis" :
                      `${ocorrencias.length} ocorrências · ${indicadores.altaRelevancia} de alta relevância`}
                  </p>
                </div>
              </div>
              <svg className="lg:hidden" width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="hidden lg:block text-left mt-[16px]">
                {carregando ? (
                  <p className="text-white/70 text-[12px]">Carregando indicadores...</p>
                ) : erro ? (
                  <p className="text-white/70 text-[12px]">Indicadores indisponíveis</p>
                ) : (
                  <div className="grid grid-cols-3 gap-[8px] w-full">
                    <div className="min-w-0 rounded-[10px] bg-white/10 px-[8px] py-[9px]">
                      <p className="text-white text-[20px] font-bold leading-none">{indicadores.total}</p>
                      <p className="text-white/80 text-[11px] leading-tight mt-[5px]">Ocorrências</p>
                    </div>
                    <div className="min-w-0 rounded-[10px] bg-white/10 px-[8px] py-[9px]">
                      <p className="text-white text-[20px] font-bold leading-none">{indicadores.emAberto}</p>
                      <p className="text-white/80 text-[11px] leading-tight mt-[5px]">Em aberto</p>
                    </div>
                    <div className="min-w-0 rounded-[10px] bg-white/10 px-[8px] py-[9px]">
                      <p className="text-white text-[20px] font-bold leading-none">{indicadores.resolvidas}</p>
                      <p className="text-white/80 text-[11px] leading-tight mt-[5px]">Resolvidas</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-x-[8px] gap-y-[4px] mt-[14px]">
                  {!carregando && !erro && (
                    <p className="text-white/65 text-[11px]">{indicadores.altaRelevancia} de alta relevância</p>
                  )}
                  <span className="inline-flex items-center gap-[4px] text-white text-[12px] font-semibold">
                    Ver indicadores completos
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Categorias + ordenação */}
          <div className="home-filters flex flex-col gap-[12px] w-full">
            <div className="home-filter-heading flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px] w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Ocorrências na cidade</p>
              <div className="home-sort flex items-center gap-[4px]">
                <span className="home-sort-label">Ordenar por</span>
                {(["relevancia", "recente"] as Ordem[]).map(o => (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={ordem === o}
                    onClick={() => setOrdem(o)}
                    className="sort-chip"
                  >
                    {o === "relevancia" ? "Mais confirmadas" : "Mais recentes"}
                  </button>
                ))}
              </div>
            </div>

            {/* Pills de categoria */}
            <FiltroCategorias categorias={categorias} selecionada={catFiltro} onSelecionar={setCatFiltro} />
            {categoriasLoading && (
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">Carregando categorias...</p>
            )}
            {!categoriasLoading && categoriasError && (
              <div className="flex flex-wrap items-center gap-[8px]">
                <p role="alert" className="text-[#586a80] text-[12px]">{categoriasError}</p>
                <button type="button" onClick={recarregarCategorias} className="rounded-[10px] border border-[#075ce5] bg-white px-[12px] py-[8px] text-[#075ce5] text-[12px] font-semibold cursor-pointer">Tentar novamente</button>
              </div>
            )}
            {!categoriasLoading && !categoriasError && categorias.length === 0 && (
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">Nenhuma categoria disponível no momento.</p>
            )}
          </div>

          {/* Lista */}
          <div className="home-list flex flex-col gap-[12px] w-full">
            {carregando ? (
              <p role="status" className="col-span-full bg-white rounded-[16px] p-[24px] text-[#586a80] text-[14px]">Carregando ocorrências...</p>
            ) : erro ? (
              <div role="alert" className="col-span-full bg-white rounded-[16px] p-[24px] flex flex-col items-start gap-[12px]">
                <p className="text-[#586a80] text-[14px]">Não foi possível carregar as ocorrências agora.</p>
                <button type="button" onClick={() => setTentativa(atual => atual + 1)}
                  className="rounded-[12px] bg-[#075ce5] px-[16px] py-[10px] text-white text-[13px] font-semibold cursor-pointer">
                  Tentar novamente
                </button>
              </div>
            ) : ordenadas.length === 0 ? (
              <div className="col-span-full bg-white rounded-[16px] p-[24px] flex flex-col items-center gap-[8px]">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">
                  {ocorrencias.length === 0 ? "Ainda não há ocorrências públicas por aqui." : "Não há ocorrências públicas nesta categoria."}
                </p>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px] text-center">
                  {ocorrencias.length === 0 ? "Quando houver novos registros públicos, eles aparecerão nesta página." :
                    "Escolha outra categoria ou volte para Todas."}
                </p>
              </div>
            ) : (
              ordenadas.map(o => (
                <OcorrenciaCard
                  key={o.id}
                  ocorrencia={o}
                  categorias={categorias}
                  categoriasLoading={categoriasLoading}
                  exibirFoto
                  fotoPrincipalUrl={o.fotoPrincipalUrl}
                  onClick={() => onOpenDetalhe(o.id)}
                />
              ))
            )}
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
