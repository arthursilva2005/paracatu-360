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

function Destaque() {
  return (
    <div className="bg-[#075ce5] relative rounded-[20px] shrink-0 w-full" data-name="Destaque">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[24px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[10px] text-white w-full">A CIDADE PELOS SEUS OLHOS</p>
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[27px] text-white w-full">Uma cidade melhor começa com você.</p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[13px] text-white w-full">Registre um problema e acompanhe cada atualização.</p>
          <div className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full" data-name="Registrar problema">
            <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriaAtiva() {
  return (
    <div className="bg-[#075ce5] content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria ativa">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">Todas</p>
    </div>
  );
}

function Categoria() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Vias</p>
    </div>
  );
}

function Categoria1() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Iluminação</p>
    </div>
  );
}

function Categoria2() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Limpeza</p>
    </div>
  );
}

function Categorias() {
  return (
    <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full" data-name="Categorias">
      <CategoriaAtiva />
      <Categoria />
      <Categoria1 />
      <Categoria2 />
    </div>
  );
}

function SecoesDaCidade() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seções da cidade">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Pela cidade</p>
      <Categorias />
    </div>
  );
}

function Ocorrencias() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Ocorrências">
      <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Ocorrência">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#075ce5] text-[12px] w-full">Vias · Encaminhado</p>
          <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">Buraco na via próximo à escola</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Centro · Local ilustrativo</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">24 confirmações · Há 2 dias</p>
        </div>
      </div>
      <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Ocorrência">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#075ce5] text-[12px] w-full">Iluminação · Em análise</p>
          <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">Ponto de iluminação apagado</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Bairro do piloto · Local ilustrativo</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">12 confirmações · Há 5 horas</p>
        </div>
      </div>
      <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Ocorrência">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#075ce5] text-[12px] w-full">Limpeza · Resolvido</p>
          <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">Entulho retirado da calçada</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Centro · Local ilustrativo</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">8 confirmações · Ontem</p>
        </div>
      </div>
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start pb-[10px] pt-[22px] px-[22px] relative size-full">
          <Destaque />
          <SecoesDaCidade />
          <Ocorrencias />
        </div>
      </div>
    </div>
  );
}

export default function Component01Inicio() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="01 · Início">
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