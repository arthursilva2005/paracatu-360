import svgPaths from "./svg-w4jnqeqhpf";

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
type BotaoPrincipalProps = {
  className?: string;
  texto?: string;
};

function BotaoPrincipal({ className, texto = "Registrar problema" }: BotaoPrincipalProps) {
  return (
    <div className={className || "bg-[#075ce5] relative rounded-[16px] w-[346px]"} data-name="Botão principal">
      <div className="content-stretch flex flex-col items-start p-[14px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[14px] text-center text-white w-full">{texto}</p>
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

function Avatar() {
  return (
    <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[24px] shrink-0 size-[48px]" data-name="Avatar">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">MJ</p>
    </div>
  );
}

function DadosDoUsuario() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.45] min-w-px not-italic relative" data-name="Dados do usuário">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[16px] w-full">Maria Joana</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[13px] w-full">maria.joana@paracatu.mg.gov.br</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[13px] w-full">12 ocorrências registradas</p>
    </div>
  );
}

function ResumoDoUsuario() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Resumo do usuário">
      <Avatar />
      <DadosDoUsuario />
    </div>
  );
}

function PerfilDoUsuario() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Perfil do usuário">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Perfil</p>
      <ResumoDoUsuario />
    </div>
  );
}

function Plus() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="plus">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="plus">
          <path d={svgPaths.p22a98e00} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]" data-name="Frame">
      <Plus />
    </div>
  );
}

function Frame1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Registrar problema</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Abra uma nova ocorrência</p>
    </div>
  );
}

function Acao() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Ação">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Bell() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bell">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="bell">
          <path d={svgPaths.p13cb380} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]" data-name="Frame">
      <Bell />
    </div>
  );
}

function Frame3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Notificações</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Acompanhe atualizações</p>
    </div>
  );
}

function Acao1() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Ação">
      <Frame2 />
      <Frame3 />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="settings">
          <path d={svgPaths.p1f61bb80} id="Vector" stroke="white" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#075ce5] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]" data-name="Frame">
      <Settings />
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Configurações</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Preferências e privacidade</p>
    </div>
  );
}

function Acao2() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-center p-[16px] relative rounded-[16px] shrink-0 w-full" data-name="Ação">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function ListaDeAcoes() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Lista de ações">
      <Acao />
      <Acao1 />
      <Acao2 />
    </div>
  );
}

function AcoesRapidas() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Ações rápidas">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Ações rápidas</p>
      <ListaDeAcoes />
    </div>
  );
}

function Header() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter:Bold',sans-serif] font-bold items-center justify-between leading-[1.45] not-italic relative shrink-0 w-full" data-name="Header">
      <p className="flex-[1_0_0] min-w-px relative text-[#10284a] text-[18px]">Minhas ocorrências</p>
      <p className="relative shrink-0 text-[#075ce5] text-[13px] whitespace-nowrap">Ver todas</p>
    </div>
  );
}

function ListaDeOcorrencias() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Lista de ocorrências">
      <Ocorrencia className="bg-white relative rounded-[16px] shrink-0 w-full" />
      <Ocorrencia categoria="Iluminação · Em análise" className="bg-white relative rounded-[16px] shrink-0 w-full" local="Bairro do piloto · Local ilustrativo" resumo="12 confirmações · Há 5 horas" titulo="Ponto de iluminação apagado" />
      <Ocorrencia categoria="Limpeza · Resolvido" className="bg-white relative rounded-[16px] shrink-0 w-full" resumo="8 confirmações · Ontem" titulo="Entulho retirado da calçada" />
    </div>
  );
}

function MinhasOcorrencias() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Minhas ocorrências">
      <Header />
      <ListaDeOcorrencias />
    </div>
  );
}

function AcaoPrincipal() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Ação principal">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[18px] w-full">Precisa de ajuda?</p>
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[#586a80] text-[13px] w-full">Acesse o centro de ajuda ou entre em contato com a equipe.</p>
      <BotaoPrincipal className="bg-[#075ce5] relative rounded-[16px] shrink-0 w-full" texto="Centro de ajuda" />
    </div>
  );
}

function Conteudo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Conteúdo">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative size-full">
          <PerfilDoUsuario />
          <AcoesRapidas />
          <MinhasOcorrencias />
          <AcaoPrincipal />
        </div>
      </div>
    </div>
  );
}

export default function Component05Perfil() {
  return (
    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-start overflow-clip relative rounded-[24px] size-full" data-name="05 · Perfil">
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