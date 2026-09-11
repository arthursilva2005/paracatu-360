type CampoProps = {
  className?: string;
  valor?: string;
};

export default function Campo({ className, valor = "Selecione uma categoria" }: CampoProps) {
  return (
    <div className={className || "bg-white relative rounded-[16px] w-[346px]"} data-name="Campo">
      <div className="content-stretch flex flex-col items-start p-[12px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[14px] w-full">{valor}</p>
      </div>
    </div>
  );
}