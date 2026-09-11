import { Ocorrencia, calcularRelevancia, corRelevancia, labelRelevancia } from "@/data/ocorrencias";

type Props = {
  ocorrencia: Ocorrencia;
  onClick?: () => void;
  showRelevancia?: boolean;
};

export default function OcorrenciaCard({ ocorrencia, onClick, showRelevancia = true }: Props) {
  const { categoria, status, titulo, local, confirmacoes, tempo } = ocorrencia;
  const relevancia = calcularRelevancia(confirmacoes);
  const cor = corRelevancia[relevancia];

  return (
    <div
      className="bg-white relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90 transition-opacity"
      onClick={onClick}
    >
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative size-full">
        {/* Linha superior: categoria + badge relevância */}
        <div className="flex items-center justify-between w-full gap-[8px]">
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[12px]">
            {categoria} · {status}
          </p>
          {showRelevancia && (
            <div className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-[999px] shrink-0 ${cor.bg}`}>
              <div className={`w-[5px] h-[5px] rounded-full shrink-0 ${cor.dot}`} />
              <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] whitespace-nowrap ${cor.text}`}>
                {labelRelevancia[relevancia]}
              </p>
            </div>
          )}
        </div>

        <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[16px] w-full">{titulo}</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] w-full">{local}</p>

        {/* Linha inferior: confirmações + tempo */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[4px]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM7 11.5L3.5 8L4.56 6.94L7 9.37L11.44 4.93L12.5 6L7 11.5Z" fill="#075ce5" opacity="0.7"/>
            </svg>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
              {confirmacoes} confirmações
            </p>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">{tempo}</p>
        </div>
      </div>
    </div>
  );
}
