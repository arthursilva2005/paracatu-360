import { Ocorrencia } from "@/data/ocorrencias";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
  ocorrencias: Ocorrencia[];
};

function CategoriaAtiva({ label }: { label: string }) {
  return (
    <div className="bg-[#075ce5] content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">{label}</p>
    </div>
  );
}

function Categoria({ label }: { label: string }) {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">{label}</p>
    </div>
  );
}

export default function Atividade({ activeTab, onNavigate, onOpenDetalhe, ocorrencias }: Props) {
  const recentes = [...ocorrencias].slice(0, 3);
  const historico = [...ocorrencias].sort((a, b) => b.confirmacoes - a.confirmacoes);

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

          <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[22px] w-full">Atividade</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Acompanhe atualizações e histórico das ocorrências.</p>
          </div>

          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] w-full">Filtre por período</p>
            <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full">
              <CategoriaAtiva label="Hoje" />
              <Categoria label="7 dias" />
              <Categoria label="30 dias" />
              <Categoria label="Todos" />
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Atualizações recentes</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">O que aconteceu nas últimas horas.</p>
            </div>
            {recentes.map(o => (
              <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
            ))}
          </div>

          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Histórico por relevância</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Ordenado pelo número de confirmações.</p>
            </div>
            {historico.map(o => (
              <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
            ))}
          </div>

          <div className="bg-[#075ce5] relative rounded-[20px] shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start p-[16px] relative size-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[10px] text-white w-full">NOVO PROBLEMA</p>
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[16px] text-white w-full">Registrar uma nova ocorrência</p>
              <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[12px] text-white w-full">Compartilhe fotos, localização e detalhes para ajudar a equipe a priorizar.</p>
              <div className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90" onClick={() => onNavigate("nova")}>
                <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
                  <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
