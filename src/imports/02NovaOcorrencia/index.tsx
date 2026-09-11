import svgPaths from "./svg-4r6l0jr5e2";

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

function Introducao() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Introdução">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[24px] w-full">Nova ocorrência</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[14px] w-full">Descreva o problema, adicione fotos e escolha o local para abrir o registro.</p>
    </div>
  );
}

function CategoriaAtiva() {
  return (
    <div className="bg-[#075ce5] content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria ativa">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">Vias</p>
    </div>
  );
}

function Categoria() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Iluminação</p>
    </div>
  );
}

function Categoria1() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Limpeza</p>
    </div>
  );
}

function Categoria2() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Segurança</p>
    </div>
  );
}

function Categoria3() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Outros</p>
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
      <Categoria3 />
    </div>
  );
}

function SecaoCategoria() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seção categoria">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Qual é a categoria?</p>
      <Categorias />
    </div>
  );
}

function MapPin() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="map-pin">
          <path d={svgPaths.p337915b0} id="Vector" stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[12px] shrink-0 size-[40px]" data-name="Frame">
      <MapPin />
    </div>
  );
}

function Frame2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Centro · Rua da Praça</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Local aproximado sugerido</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="chevron-right">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="#586A80" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Frame">
      <Frame1 />
      <Frame2 />
      <ChevronRight />
    </div>
  );
}

function Edit() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="edit-3">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g clipPath="url(#clip0_0_21)" id="edit-3">
          <path d={svgPaths.p29f8df00} id="Vector" stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_21">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AjustarLocal() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex gap-[8px] items-center px-[12px] py-[10px] relative rounded-[12px] shrink-0 w-full" data-name="Ajustar local">
      <Edit />
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] min-w-px not-italic relative text-[#075ce5] text-[13px]">Ajustar local no mapa</p>
    </div>
  );
}

function CardLocal() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Card local">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Frame />
      <AjustarLocal />
    </div>
  );
}

function SecaoLocal() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seção local">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Onde aconteceu?</p>
      <CardLocal />
    </div>
  );
}

function CampoDescricao() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[140px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Campo descrição">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[14px] w-full">Descreva o que está acontecendo, onde exatamente o problema está e qualquer detalhe importante.</p>
    </div>
  );
}

function SecaoDescricao() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seção descrição">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Descreva o problema</p>
      <CampoDescricao />
    </div>
  );
}

function Camera() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="camera">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="camera">
          <path d={svgPaths.p37770280} id="Vector" stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function AdicionarFoto() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[96px]" data-name="Adicionar foto">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-dashed inset-0 pointer-events-none rounded-[16px]" />
      <Camera />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[12px] whitespace-nowrap">Tirar foto</p>
    </div>
  );
}

function Image() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="image">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="image">
          <path d={svgPaths.p2c44b300} id="Vector" stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function AdicionarFoto1() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[96px]" data-name="Adicionar foto">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-dashed inset-0 pointer-events-none rounded-[16px]" />
      <Image />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[12px] whitespace-nowrap">Galeria</p>
    </div>
  );
}

function Video() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="video">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="video">
          <path d={svgPaths.p83a900} id="Vector" stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function AdicionarFoto2() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[96px]" data-name="Adicionar foto">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-dashed inset-0 pointer-events-none rounded-[16px]" />
      <Video />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[12px] whitespace-nowrap">Vídeo</p>
    </div>
  );
}

function Fotos() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Fotos">
      <AdicionarFoto />
      <AdicionarFoto1 />
      <AdicionarFoto2 />
    </div>
  );
}

function SecaoFotos() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seção fotos">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Adicione fotos</p>
      <Fotos />
    </div>
  );
}

function SecaoFinal() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Seção final">
      <div className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full" data-name="Registrar problema">
        <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[12px] text-center w-full">Ao registrar, você receberá atualizações sobre o andamento do caso.</p>
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative size-full">
          <Introducao />
          <SecaoCategoria />
          <SecaoLocal />
          <SecaoDescricao />
          <SecaoFotos />
          <SecaoFinal />
        </div>
      </div>
    </div>
  );
}

export default function Component02NovaOcorrencia() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="02 · Nova ocorrência">
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