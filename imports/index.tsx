type OcorrenciaProps = {
  className?: string;
  categoria?: string;
  local?: string;
  resumo?: string;
  titulo?: string;
};

export default function Ocorrencia({ className, categoria = "Vias · Encaminhado", local = "Centro · Local ilustrativo", resumo = "24 confirmações · Há 2 dias", titulo = "Buraco na via próximo à escola" }: OcorrenciaProps) {
  return (
    <div className={className || "bg-white relative rounded-[16px] w-[346px]"} data-name="Ocorrência">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#075ce5] text-[12px] w-full">{categoria}</p>
        <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">{titulo}</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">{local}</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">{resumo}</p>
      </div>
    </div>
  );
}