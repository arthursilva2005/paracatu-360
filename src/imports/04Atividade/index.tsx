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

function TituloDaTela() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Título da tela">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[22px] w-full">Atividade</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Acompanhe atualizações e histórico das ocorrências.</p>
    </div>
  );
}

function CategoriaAtiva() {
  return (
    <div className="bg-[#075ce5] content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria ativa">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">Hoje</p>
    </div>
  );
}

function Categoria() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">7 dias</p>
    </div>
  );
}

function Categoria1() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">30 dias</p>
    </div>
  );
}

function Categoria2() {
  return (
    <div className="bg-white content-stretch flex items-start px-[12px] py-[8px] relative rounded-[999px] shrink-0" data-name="Categoria">
      <div aria-hidden className="absolute border border-[#d7e3f0] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] whitespace-nowrap">Todos</p>
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
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] w-full">Filtre por período</p>
      <Categorias />
    </div>
  );
}

function TituloDaSecao() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Título da seção">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Atualizações recentes</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">O que aconteceu nas últimas horas.</p>
    </div>
  );
}

function ListaDeAtualizacoes() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Lista de atualizações">
      <Ocorrencia categoria="Vias · Em atendimento" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Centro · Rua da Praça" resumo="Equipe de manutenção enviada · Há 15 min" />
      <Ocorrencia categoria="Iluminação · Em análise" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Bairro do Piloto · Rua das Flores" resumo="Laudo técnico publicado · Há 2 horas" titulo="Ponto de iluminação apagado" />
      <Ocorrencia categoria="Limpeza · Resolvido" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Centro · Calçada da Igreja" resumo="Serviço concluído · Ontem" titulo="Entulho retirado da calçada" />
    </div>
  );
}

function Atualizacoes() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Atualizações">
      <TituloDaSecao />
      <ListaDeAtualizacoes />
    </div>
  );
}

function TituloDaSecao1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full" data-name="Título da seção">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Histórico</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Ocorrências registradas e acompanhadas.</p>
    </div>
  );
}

function ListaDeHistorico() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Lista de histórico">
      <Ocorrencia className="bg-white relative rounded-[16px] shrink-0 w-full" />
      <Ocorrencia categoria="Iluminação · Em análise" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Bairro do Piloto · Local ilustrativo" resumo="12 confirmações · Há 5 horas" titulo="Ponto de iluminação apagado" />
      <Ocorrencia categoria="Limpeza · Resolvido" className="bg-white relative rounded-[16px] shrink-0 w-full" resumo="8 confirmações · Ontem" titulo="Entulho retirado da calçada" />
    </div>
  );
}

function Historico() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Histórico">
      <TituloDaSecao1 />
      <ListaDeHistorico />
    </div>
  );
}

function AcaoPrincipal() {
  return (
    <div className="bg-[#075ce5] relative rounded-[16px] shrink-0 w-full" data-name="Ação principal">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[16px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[10px] text-white w-full">NOVO PROBLEMA</p>
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[16px] text-white w-full">Registrar uma nova ocorrência</p>
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[12px] text-white w-full">Compartilhe fotos, localização e detalhes para ajudar a equipe a priorizar.</p>
        <div className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full" data-name="Botão principal">
          <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] text-center w-full">Registrar problema</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative size-full">
          <TituloDaTela />
          <Filtros />
          <Atualizacoes />
          <Historico />
          <AcaoPrincipal />
        </div>
      </div>
    </div>
  );
}

export default function Component04Atividade() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="04 · Atividade">
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