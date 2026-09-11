import svgPaths from "../../imports/svg-w4jnqeqhpf";
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

export default function Perfil({ activeTab, onNavigate, onOpenDetalhe, ocorrencias }: Props) {
  const totalConfirmacoes = ocorrencias.reduce((acc, o) => acc + (o.confirmadoPorMim ? 1 : 0), 0);

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="flex-1 overflow-y-auto w-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

          {/* Perfil do usuário */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Perfil</p>
            <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full">
              <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[24px] shrink-0 size-[48px]">
                <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">MJ</p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.45] min-w-px not-italic relative">
                <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">Maria Joana</p>
                <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[13px] w-full">maria.joana@paracatu.mg.gov.br</p>
                <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[13px] w-full">{ocorrencias.length} ocorrências · {totalConfirmacoes} confirmadas por mim</p>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Ações rápidas</p>
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90" onClick={() => onNavigate("nova")}>
                <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]">
                  <div className="relative shrink-0 size-[18px]">
                    <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18">
                      <path d={svgPaths.p22a98e00} stroke="white" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative">
                  <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Registrar problema</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Abra uma nova ocorrência</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90">
                <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]">
                  <div className="relative shrink-0 size-[18px]">
                    <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18">
                      <path d={svgPaths.p13cb380} stroke="white" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative">
                  <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Notificações</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Acompanhe atualizações</p>
                </div>
              </div>
              <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90">
                <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]">
                  <div className="relative shrink-0 size-[18px]">
                    <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 18">
                      <path d={svgPaths.p1f61bb80} stroke="white" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative">
                  <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Configurações</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Preferências e privacidade</p>
                </div>
              </div>
            </div>
          </div>

          {/* Minhas ocorrências */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <div className="[word-break:break-word] content-stretch flex font-['Inter:Bold',sans-serif] font-bold items-center justify-between leading-[1.45] not-italic relative shrink-0 w-full">
              <p className="flex-[1_0_0] min-w-px relative text-[#10284a] text-[18px]">Minhas ocorrências</p>
              <p className="relative shrink-0 text-[#075ce5] text-[13px] whitespace-nowrap">Ver todas</p>
            </div>
            {ocorrencias.map(o => (
              <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
            ))}
          </div>

          {/* Precisa de ajuda */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Precisa de ajuda?</p>
            <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[13px] w-full">Acesse o centro de ajuda ou entre em contato com a equipe.</p>
            <div className="bg-[#075ce5] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90">
              <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
                <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[14px] text-center text-white w-full">Centro de ajuda</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
