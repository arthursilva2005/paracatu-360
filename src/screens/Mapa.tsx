import svgPaths from "../../imports/svg-fgppstdvre";
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

function MapPlaceholder({ count }: { count: number }) {
  return (
    <div className="h-[280px] relative rounded-[20px] shrink-0 w-full bg-[#d7e3f0] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f0fb] to-[#c5d8f0]" />
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="70" x2="390" y2="70" stroke="#075ce5" strokeWidth="2"/>
        <line x1="0" y1="140" x2="390" y2="140" stroke="#075ce5" strokeWidth="2"/>
        <line x1="0" y1="210" x2="390" y2="210" stroke="#075ce5" strokeWidth="1"/>
        <line x1="80" y1="0" x2="80" y2="280" stroke="#075ce5" strokeWidth="2"/>
        <line x1="180" y1="0" x2="180" y2="280" stroke="#075ce5" strokeWidth="1"/>
        <line x1="270" y1="0" x2="270" y2="280" stroke="#075ce5" strokeWidth="2"/>
        <line x1="350" y1="0" x2="350" y2="280" stroke="#075ce5" strokeWidth="1"/>
      </svg>
      <div className="absolute left-[72px] top-[64px] bg-[#dc2626] drop-shadow-[0px_4px_5px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center rounded-[16px] size-[32px]">
        <div className="relative size-[16px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p8b99100} stroke="white" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[248px] top-[118px] bg-[#d97706] drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-[16px] size-[32px]">
        <div className="relative size-[16px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p8b99100} stroke="white" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[154px] top-[194px] bg-[#075ce5] drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-[16px] size-[32px]">
        <div className="relative size-[16px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p8b99100} stroke="white" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[88px] top-[208px] bg-[#075ce5] drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-[16px] size-[32px]">
        <div className="relative size-[16px]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p8b99100} stroke="white" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      {/* Legenda com contagem real */}
      <div className="absolute bg-[rgba(255,255,255,0.92)] flex gap-[8px] items-center left-[16px] px-[10px] py-[8px] rounded-[999px] top-[16px]">
        <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
        <div className="bg-[#075ce5] relative rounded-[4px] shrink-0 size-[8px]" />
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[12px] whitespace-nowrap">{count} ocorrências próximas</p>
      </div>
      {/* Legenda relevância */}
      <div className="absolute bottom-[12px] right-[12px] bg-[rgba(255,255,255,0.92)] flex gap-[12px] items-center px-[10px] py-[7px] rounded-[12px]">
        <div className="flex items-center gap-[4px]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#dc2626]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[10px]">Alta</p>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#d97706]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[10px]">Média</p>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#075ce5]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[10px]">Baixa</p>
        </div>
      </div>
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}

export default function Mapa({ activeTab, onNavigate, onOpenDetalhe, ocorrencias }: Props) {
  const ordenadas = [...ocorrencias].sort((a, b) => b.confirmacoes - a.confirmacoes);

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start p-[22px] relative w-full">
          <MapPlaceholder count={ocorrencias.length} />

          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Filtros</p>
            <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full">
              <CategoriaAtiva label="Todas" />
              <Categoria label="Vias" />
              <Categoria label="Iluminação" />
              <Categoria label="Limpeza" />
              <Categoria label="Segurança" />
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Ocorrências próximas</p>
            {ordenadas.map(o => (
              <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
            ))}
          </div>

          <div
            className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90"
            onClick={() => onNavigate("nova")}
          >
            <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
            </div>
          </div>
        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
