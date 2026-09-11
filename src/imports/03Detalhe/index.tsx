function Navegacao({ className }: { className?: string }) {
  return (
    <div className={className || "bg-white h-[36px] relative"} data-name="Navegação">
      <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[1.45] not-italic p-[18px] relative size-full text-[#075ce5] text-center">
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[11px] w-[62px]">Início</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[11px] w-[62px]">Mapa</p>
        <p className="font-['Inter:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold relative shrink-0 text-[22px] w-[62px]">＋</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[11px] w-[62px]">Atividade</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[11px] w-[62px]">Perfil</p>
      </div>
    </div>
  );
}

function TituloDaOcorrencia() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Título da ocorrência">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#075ce5] text-[10px] w-full">OCORRÊNCIA · DETALHAMENTO</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[24px] w-full">Buraco na via próximo à escola</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Centro · Local ilustrativo</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#075ce5] content-stretch flex items-start px-[10px] py-[6px] relative rounded-[999px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">Encaminhado</p>
    </div>
  );
}

function Status() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Status">
      <Frame />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] min-w-px not-italic relative text-[#586a80] text-[12px]">24 confirmações · Há 2 dias</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80]">Categoria</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a]">Vias</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80]">Local</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a]">Centro · Local ilustrativo</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80]">Atualizado</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a]">Há 2 dias</p>
    </div>
  );
}

function Informacoes() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start leading-[1.45] not-italic relative shrink-0 text-[13px] w-full whitespace-nowrap" data-name="Informações">
      <Frame1 />
      <Frame2 />
      <Frame3 />
    </div>
  );
}

function ResumoDaOcorrencia() {
  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Resumo da ocorrência">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
        <Status />
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[12px] w-full">O buraco está localizado na pista sentido escola, próximo ao cruzamento com a Rua das Flores. O trecho está com trânsito lento e risco de danos a veículos.</p>
        <Informacoes />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[13px]">Encaminhado para manutenção</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px]">Há 2 dias</p>
    </div>
  );
}

function Atualizacao() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Atualização 1">
      <Frame4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">A ocorrência foi enviada para a equipe de infraestrutura urbana e está em análise para agendamento da reparo.</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[13px]">Confirmações recebidas</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px]">Há 3 dias</p>
    </div>
  );
}

function Atualizacao1() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Atualização 2">
      <Frame5 />
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">24 moradores confirmaram a ocorrência e a equipe já iniciou o levantamento do local.</p>
    </div>
  );
}

function Atualizacoes() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Atualizações">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Atualizações</p>
      <Atualizacao />
      <Atualizacao1 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <div className="bg-[#075ce5] flex-[1_0_28px] min-w-px relative rounded-[16px]" data-name="Botão principal">
        <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[14px] text-center text-white w-full">Confirmar problema</p>
        </div>
      </div>
      <div className="bg-white flex-[1_0_30px] min-w-px relative rounded-[16px]" data-name="Botão principal">
        <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
        <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Compartilhar</p>
        </div>
      </div>
    </div>
  );
}

function Acoes() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Ações">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Ações</p>
      <Frame6 />
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative size-full">
          <TituloDaOcorrencia />
          <ResumoDaOcorrencia />
          <Atualizacoes />
          <Acoes />
        </div>
      </div>
    </div>
  );
}

export default function Component03Detalhe() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="03 · Detalhe">
      <div className="bg-white relative shrink-0 w-full" data-name="Cabeçalho">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[22px] relative size-full">
          <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#075ce5] text-[24px] w-full">Paracatu360</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Paracatu, Minas Gerais</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[10px] w-full">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
        </div>
      </div>
      <Conteudo />
      <Navegacao className="bg-white h-[54px] relative shrink-0" />
    </div>
  );
}