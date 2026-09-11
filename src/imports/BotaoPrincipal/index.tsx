type BotaoPrincipalProps = {
  className?: string;
  texto?: string;
};

export default function BotaoPrincipal({ className, texto = "Registrar problema" }: BotaoPrincipalProps) {
  return (
    <div className={className || "bg-[#075ce5] relative rounded-[16px] w-[346px]"} data-name="Botão principal">
      <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[14px] text-center text-white w-full">{texto}</p>
      </div>
    </div>
  );
}