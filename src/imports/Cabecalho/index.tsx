export default function Cabecalho({ className }: { className?: string }) {
  return (
    <div className={className || "bg-white relative w-[390px]"} data-name="Cabeçalho">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[22px] relative size-full">
        <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#075ce5] text-[24px] w-full">Paracatu360</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Paracatu, Minas Gerais</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[10px] w-full">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
      </div>
    </div>
  );
}