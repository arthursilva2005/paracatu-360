import { useState } from "react";
import { Ocorrencia } from "@/data/ocorrencias";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
  onOpenDashboard: () => void;
  ocorrencias: Ocorrencia[];
};

type Ordem = "relevancia" | "recente";

const CATEGORIAS = ["Todas", "Vias", "Iluminação", "Limpeza", "Segurança", "Outros"] as const;
type CatFiltro = typeof CATEGORIAS[number];

export default function Inicio({ activeTab, onNavigate, onOpenDetalhe, onOpenDashboard, ocorrencias }: Props) {
  const [ordem, setOrdem] = useState<Ordem>("relevancia");
  const [catFiltro, setCatFiltro] = useState<CatFiltro>("Todas");

  const filtradas = ocorrencias.filter(o => catFiltro === "Todas" || o.categoria === catFiltro);
  const ordenadas = [...filtradas].sort((a, b) =>
    ordem === "relevancia" ? b.confirmacoes - a.confirmacoes : 0
  );

  const totalAlta = ocorrencias.filter(o => o.confirmacoes >= 30).length;

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col gap-[20px] items-start pb-[16px] pt-[22px] px-[22px] w-full">

          {/* Hero */}
          <div className="bg-[#075ce5] relative rounded-[20px] w-full overflow-hidden">
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
            className="w-full bg-[#10284a] rounded-[16px] border-none outline-none cursor-pointer active:opacity-90 transition-opacity overflow-hidden"
          >
            <div className="flex items-center justify-between px-[18px] py-[14px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#ffcc36] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      stroke="#10284a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[14px]">Dashboard 360</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-white/60 text-[11px]">
                    {ocorrencias.length} ocorrências · {totalAlta} de alta relevância
                  </p>
                </div>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Categorias + ordenação */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Pela cidade</p>
              <div className="flex gap-[6px]">
                {(["relevancia", "recente"] as Ordem[]).map(o => (
                  <button
                    key={o}
                    onClick={() => setOrdem(o)}
                    className={`px-[10px] py-[5px] rounded-[999px] text-[11px] font-['Inter:Semi_Bold',sans-serif] font-semibold border-none outline-none cursor-pointer transition-colors ${
                      ordem === o ? "bg-[#075ce5] text-white" : "bg-white text-[#586a80] border border-[#d7e3f0]"
                    }`}
                  >
                    {o === "relevancia" ? "Relevância" : "Recente"}
                  </button>
                ))}
              </div>
            </div>

            {/* Pills de categoria */}
            <div className="flex flex-wrap gap-[8px]">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFiltro(cat)}
                  className={`px-[12px] py-[7px] rounded-[999px] border-none outline-none cursor-pointer transition-colors ${
                    catFiltro === cat ? "bg-[#075ce5]" : "bg-white border border-[#d7e3f0]"
                  }`}
                >
                  <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] ${catFiltro === cat ? "text-white" : "text-[#10284a]"}`}>
                    {cat}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex flex-col gap-[12px] w-full">
            {ordenadas.length === 0 ? (
              <div className="bg-white rounded-[16px] p-[24px] flex flex-col items-center gap-[8px]">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Nenhuma ocorrência</p>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px] text-center">
                  Não há ocorrências na categoria "{catFiltro}" ainda.
                </p>
              </div>
            ) : (
              ordenadas.map(o => (
                <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
              ))
            )}
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
