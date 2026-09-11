import svgPaths from "./svg-fgppstdvre";
import imgMapa from "./8c6226c3f6130d9d0b9b971f7d598b626029572d.png";

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
type OcorrenciaProps = {
  className?: string;
  categoria?: string;
  local?: string;
  resumo?: string;
  titulo?: string;
};

function Ocorrencia({ className, categoria = "Vias · Encaminhado", local = "Centro · Local ilustrativo", resumo = "24 confirmações · Há 2 dias", titulo = "Buraco na via próximo à escola" }: OcorrenciaProps) {
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

function MapPin() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="map-pin">
          <path d={svgPaths.p8b99100} id="Vector" stroke="#10284A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Marcador() {
  return (
    <div className="absolute bg-[#ffcc36] content-stretch drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center left-[72px] rounded-[16px] size-[32px] top-[64px]" data-name="Marcador 1">
      <MapPin />
    </div>
  );
}

function MapPin1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="map-pin">
          <path d={svgPaths.p8b99100} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Marcador1() {
  return (
    <div className="absolute bg-[#075ce5] content-stretch drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center left-[248px] rounded-[16px] size-[32px] top-[118px]" data-name="Marcador 2">
      <MapPin1 />
    </div>
  );
}

function MapPin2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="map-pin">
          <path d={svgPaths.p8b99100} id="Vector" stroke="#10284A" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Marcador2() {
  return (
    <div className="absolute bg-[#ffcc36] content-stretch drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center left-[154px] rounded-[16px] size-[32px] top-[194px]" data-name="Marcador 3">
      <MapPin2 />
    </div>
  );
}

function MapPin3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="map-pin">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="map-pin">
          <path d={svgPaths.p8b99100} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Marcador3() {
  return (
    <div className="absolute bg-[#075ce5] content-stretch drop-shadow-[0px_4px_5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center left-[88px] rounded-[16px] size-[32px] top-[208px]" data-name="Marcador 4">
      <MapPin3 />
    </div>
  );
}

function Frame() {
  return <div className="bg-[#075ce5] relative rounded-[4px] shrink-0 size-[8px]" data-name="Frame" />;
}

function Legenda() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] content-stretch flex gap-[8px] items-center left-[16px] px-[10px] py-[8px] rounded-[999px] top-[16px]" data-name="Legenda">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <Frame />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[12px] whitespace-nowrap">4 ocorrências próximas</p>
    </div>
  );
}

function Mapa() {
  return (
    <div className="h-[280px] relative rounded-[20px] shrink-0 w-full" data-name="Mapa">
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[20px]">
        <img alt="" className="absolute max-w-none object-cover rounded-[20px] size-full" src={imgMapa} />
        <div className="absolute bg-[rgba(255,255,255,0.08)] inset-0 rounded-[20px]" />
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Marcador />
        <Marcador1 />
        <Marcador2 />
        <Marcador3 />
        <Legenda />
      </div>
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[20px]" />
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

function Filtros() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Filtros">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Filtros</p>
      <Categorias />
    </div>
  );
}

function Ocorrencias() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Ocorrências">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Ocorrências próximas</p>
      <Ocorrencia className="bg-white relative rounded-[16px] shrink-0 w-full" />
      <Ocorrencia categoria="Iluminação · Em análise" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Bairro do piloto · Local ilustrativo" resumo="12 confirmações · Há 5 horas" titulo="Ponto de iluminação apagado" />
      <Ocorrencia categoria="Limpeza · Resolvido" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Praça central · Local ilustrativo" resumo="8 confirmações · Ontem" titulo="Entulho retirado da calçada" />
    </div>
  );
}

function Acao() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full" data-name="Ação">
      <div className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full" data-name="Botão principal">
        <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
        </div>
      </div>
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start p-[22px] relative size-full">
          <Mapa />
          <Filtros />
          <Ocorrencias />
          <Acao />
        </div>
      </div>
    </div>
  );
}

export default function Component06Mapa() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="06 · Mapa">
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