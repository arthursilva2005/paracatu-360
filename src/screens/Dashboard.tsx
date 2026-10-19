import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { METADADOS_STATUS, corRelevancia, labelRelevancia, type Ocorrencia } from "@/data/ocorrencias";
import { EstadoCategorias, normalizarCodigoCategoria, resolverCategoria } from "@/hooks/useCategorias";
import { useAuth } from "@/context/AuthContext";
import { calcularIndicadoresDashboard } from "@/lib/indicadores";
import { listarOcorrenciasPublicas } from "@/lib/ocorrencias";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = EstadoCategorias & {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onBack: () => void;
};

type KPIProps = { valor: string | number; label: string; cor: string; icon: React.ReactNode };

function KPI({ valor, label, cor, icon }: KPIProps) {
  return (
    <div className="bg-white rounded-[16px] flex-1 p-[14px] flex flex-col gap-[8px] border border-[#e8eef5]">
      <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center ${cor}`}>
        {icon}
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px] leading-none">{valor}</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[11px] leading-tight">{label}</p>
    </div>
  );
}

const catColors: Record<string, string> = {
  "transito-vias":      "#075ce5",
  "infraestrutura":     "#d97706",
  "limpeza-urbana":     "#16a34a",
  "meio-ambiente":      "#0284c7",
  "agua-saneamento":    "#0f766e",
  "seguranca":          "#dc2626",
  "outros":             "#7c3aed",
};

export default function Dashboard({
  activeTab,
  onNavigate,
  onBack,
  categorias,
  categoriasLoading,
  categoriasError,
  recarregarCategorias,
}: Props) {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);
    setOcorrencias([]);

    void listarOcorrenciasPublicas({ incluirCapas: false }).then(lista => {
      if (ativo) setOcorrencias(lista);
    }).catch(error => {
      if (!ativo) return;
      console.error("Não foi possível carregar os indicadores.", error);
      setErro(true);
    }).finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => { ativo = false; };
  }, [user?.id]);

  const indicadores = useMemo(
    () => calcularIndicadoresDashboard(ocorrencias, categorias),
    [ocorrencias, categorias],
  );
  const maxCat = Math.max(...indicadores.porCategoria.map(item => item.count), 1);
  const maxBairro = Math.max(...indicadores.porBairro.map(item => item.count), 1);

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />

      {/* Barra de volta */}
      <div className="bg-white w-full px-[16px] py-[10px] flex items-center gap-[8px] border-b border-[#e8eef5]">
        <button
          onClick={onBack}
          className="flex items-center gap-[6px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[7px] border-none outline-none cursor-pointer active:opacity-70"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[13px]">Voltar</p>
        </button>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] ml-[4px]">Inteligência urbana</p>
      </div>

      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content layout-dashboard flex flex-col gap-[20px] p-[22px] w-full pb-[16px]">

          {/* Cabeçalho do dashboard */}
          <div className="dashboard-title flex flex-col gap-[4px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px]">Indicadores da cidade</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">
              Visão geral das ocorrências públicas.
            </p>
          </div>

          {carregando && <p role="status" className="bg-white rounded-[16px] p-[16px] text-[#586a80] text-[13px]">Carregando indicadores...</p>}
          {!carregando && erro && <p role="alert" className="bg-white rounded-[16px] p-[16px] text-[#586a80] text-[13px]">Não foi possível carregar os indicadores agora.</p>}
          {!carregando && !erro && <>
          {indicadores.total === 0 && (
            <p className="bg-white rounded-[16px] p-[16px] text-[#586a80] text-[13px]">Nenhuma ocorrência pública registrada ainda.</p>
          )}

          {/* KPIs — linha 1 */}
          <div className="dashboard-kpis-primary flex gap-[10px] w-full">
            <KPI
              valor={indicadores.total}
              label="Total de ocorrências"
              cor="bg-[#e8f0fe]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#075ce5" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={indicadores.emAberto}
              label="Em aberto"
              cor="bg-[#f3e8ff]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={indicadores.resolvidas}
              label="Resolvidas"
              cor="bg-[#dcfce7]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
          </div>

          {/* KPIs — linha 2 */}
          <div className="dashboard-kpis-secondary flex gap-[10px] w-full -mt-[10px]">
            <KPI
              valor={indicadores.duplicadas}
              label="Duplicadas"
              cor="bg-[#fef9c3]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
            <KPI
              valor={indicadores.altaRelevancia}
              label="Alta relevância"
              cor="bg-[#fee2e2]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={indicadores.confirmacoesAtivas}
              label="Total de confirmações"
              cor="bg-[#e0f2fe]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
          </div>

          <div className="dashboard-analysis">
          {/* Distribuição por categoria */}
          <div className="dashboard-categories bg-white rounded-[16px] p-[16px] flex flex-col gap-[14px] border border-[#e8eef5]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Ocorrências por categoria</p>
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
            {!categoriasLoading && !categoriasError && indicadores.porCategoria.map(({ categoria, count }) => (
              <div key={categoria.id} className="flex flex-col gap-[5px]">
                <div className="flex items-center justify-between">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#10284a] text-[13px]">{categoria.nome}</p>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{count}</p>
                </div>
                <div className="w-full bg-[#f3f6fa] rounded-full h-[8px] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCat) * 100}%`, backgroundColor: catColors[normalizarCodigoCategoria(categoria.codigo).replace(/_/g, "-")] ?? "#586a80" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status overview */}
          <div className="dashboard-status bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] border border-[#e8eef5]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Status das ocorrências</p>
            <div className="flex flex-wrap gap-[8px]">
              {indicadores.porStatus.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-[7px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[8px]">
                  <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: METADADOS_STATUS[status].bg }} />
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">{METADADOS_STATUS[status].label}</p>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{count}</p>
                </div>
              ))}
            </div>

            {/* Barra visual de status */}
            <div className="w-full h-[10px] rounded-full overflow-hidden flex bg-[#f3f6fa]">
              {indicadores.porStatus.filter(s => s.count > 0).map(({ status, count }) => (
                <div
                  key={status}
                  className="h-full transition-all"
                  style={{ width: `${(count / indicadores.total) * 100}%`, backgroundColor: METADADOS_STATUS[status].bg }}
                />
              ))}
            </div>
          </div>

          {/* Relevância calculada a partir de confirmações ativas */}
          <div className="dashboard-relevance bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] border border-[#e8eef5]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Relevância das ocorrências</p>
            {indicadores.porRelevancia.map(({ nivel, count }) => (
              <div key={nivel} className="flex flex-col gap-[5px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] ${corRelevancia[nivel].text}`}>{labelRelevancia[nivel]}</p>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{count}</p>
                </div>
                <div className="w-full bg-[#f3f6fa] rounded-full h-[8px] overflow-hidden">
                  <div className={`h-full rounded-full ${corRelevancia[nivel].dot}`}
                    style={{ width: `${indicadores.total ? count / indicadores.total * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bairros informados nas ocorrências públicas */}
          <div className="dashboard-neighborhoods bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] border border-[#e8eef5]">
            <div className="flex items-center justify-between">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Bairros com mais ocorrências</p>
            </div>
            {indicadores.porBairro.length === 0 && <p className="text-[#586a80] text-[12px]">Nenhum bairro disponível.</p>}
            {indicadores.porBairro.map(({ bairro, count }) => (
              <div key={bairro} className="flex items-center gap-[10px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] w-[130px] max-w-[40%] shrink-0 break-words">{bairro || "Bairro não informado"}</p>
                <div className="flex-1 bg-[#f3f6fa] rounded-full h-[7px] overflow-hidden">
                  <div className="h-full bg-[#075ce5] rounded-full" style={{ width: `${(count / maxBairro) * 100}%` }} />
                </div>
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[12px] w-[16px] text-right">{count}</p>
              </div>
            ))}
          </div>
          </div>

          {/* Ocorrências mais recentes */}
          <div className="dashboard-recent flex flex-col gap-[12px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Ocorrências recentes</p>
            {indicadores.recentes.length === 0 && <p className="text-[#586a80] text-[12px]">Nenhuma ocorrência para mostrar.</p>}
            {indicadores.recentes.map(ocorrencia => (
              <Link key={ocorrencia.id} to={`/ocorrencias/${ocorrencia.id}`}
                state={{ from: "/indicadores", activeTab }}
                className="bg-white rounded-[16px] p-[16px] border border-[#e8eef5] flex flex-col gap-[7px] no-underline min-w-0 hover:border-[#075ce5] focus-visible:outline-2 focus-visible:outline-[#075ce5]">
                <span className="text-[#075ce5] text-[12px] break-words">
                  {resolverCategoria(ocorrencia.categoriaId, categorias)?.nome ?? (categoriasLoading ? "Carregando categoria" : "Categoria indisponível")}
                  {" · "}{METADADOS_STATUS[ocorrencia.status].label}
                </span>
                <span className="font-bold text-[#10284a] text-[14px] break-words">{ocorrencia.titulo}</span>
                <span className="text-[#586a80] text-[12px] break-words">
                  {ocorrencia.bairro} · {new Date(ocorrencia.criadoEm).toLocaleDateString("pt-BR")}
                  {" · "}{ocorrencia.quantidadeConfirmacoes} confirmações
                </span>
              </Link>
            ))}
          </div>

          {/* Top ocorrências */}
          <div className="dashboard-occurrences flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Mais confirmadas</p>
              <button
                onClick={() => onNavigate("inicio")}
                className="bg-transparent border-none outline-none cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[12px]">Ver todas</p>
              </button>
            </div>
            {indicadores.maisRelevantes.length === 0 && <p className="text-[#586a80] text-[12px]">Nenhuma ocorrência para mostrar.</p>}
            {indicadores.maisRelevantes.map(o => (
              <Link key={o.id} to={`/ocorrencias/${o.id}`} state={{ from: "/indicadores", activeTab }}
                className="block no-underline rounded-[16px] focus-visible:outline-2 focus-visible:outline-[#075ce5]">
                <OcorrenciaCard ocorrencia={o} categorias={categorias}
                  categoriasLoading={categoriasLoading} />
              </Link>
            ))}
          </div>

          </>}

          {/* CTA */}
          <button
            onClick={() => onNavigate("nova")}
            className="dashboard-action bg-[#075ce5] hover:bg-[#0a47b8] active:scale-[0.98] w-full rounded-[16px] py-[15px] border-none outline-none cursor-pointer transition-all"
          >
            <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[15px]">Registrar nova ocorrência</p>
          </button>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
