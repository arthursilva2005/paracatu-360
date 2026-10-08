import { useEffect, useState } from "react";
import {
  METADADOS_STATUS,
  calcularRelevancia,
  corRelevancia,
  labelRelevancia,
} from "@/data/ocorrencias";
import { EstadoCategorias, resolverCategoria } from "@/hooks/useCategorias";
import { listarAtividadesOficiais, type AtividadeOficial } from "@/lib/atividades";
import { useAuth } from "@/context/AuthContext";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = EstadoCategorias & {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
};

type Periodo = "hoje" | "7dias" | "30dias" | "todos";

const PERIODOS: { valor: Periodo; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "7dias", label: "7 dias" },
  { valor: "30dias", label: "30 dias" },
  { valor: "todos", label: "Todos" },
];

const formatadorDia = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function diaEmParacatu(data: Date): string {
  const partes = Object.fromEntries(formatadorDia.formatToParts(data).map(parte => [parte.type, parte.value]));
  return [partes.year, partes.month, partes.day].join("-");
}

function filtrarPeriodo(itens: AtividadeOficial[], periodo: Periodo, agora: Date): AtividadeOficial[] {
  if (periodo === "todos") return itens;

  const inicio = periodo === "hoje"
    ? null
    : agora.getTime() - (periodo === "7dias" ? 7 : 30) * 24 * 60 * 60 * 1000;
  const hoje = periodo === "hoje" ? diaEmParacatu(agora) : null;

  return itens.filter(item => {
    const data = new Date(item.evento.criadoEm);
    const timestamp = data.getTime();
    if (!Number.isFinite(timestamp)) return false;
    return hoje !== null
      ? diaEmParacatu(data) === hoje
      : timestamp >= inicio! && timestamp <= agora.getTime();
  });
}

function CartaoAtividade({
  item,
  categorias,
  categoriasLoading,
  onOpenDetalhe,
}: {
  item: AtividadeOficial;
  categorias: EstadoCategorias["categorias"];
  categoriasLoading: boolean;
  onOpenDetalhe: (id: string) => void;
}) {
  const { evento, ocorrencia } = item;
  const categoria = resolverCategoria(ocorrencia.categoriaId, categorias);
  const nomeCategoria = categoria?.nome ?? (categoriasLoading ? "Carregando categoria" : "Categoria indisponível");
  const relevancia = calcularRelevancia(ocorrencia.quantidadeConfirmacoes);
  const cor = corRelevancia[relevancia];
  const data = new Date(evento.criadoEm);
  const dataHora = Number.isFinite(data.getTime())
    ? formatadorDataHora.format(data)
    : "Data indisponível";
  const tituloEvento = evento.statusAnterior === null
    ? "Ocorrência registrada"
    : "Status alterado para " + METADADOS_STATUS[evento.statusNovo].label;

  return (
    <button
      type="button"
      onClick={() => onOpenDetalhe(ocorrencia.id)}
      className="occurrence-card bg-white rounded-[16px] w-full p-[16px] text-left cursor-pointer active:opacity-90 transition-opacity flex flex-col gap-[8px] min-w-0"
      aria-label={tituloEvento + ": " + ocorrencia.titulo + ". Abrir ocorrência"}
    >
      <div className="flex flex-wrap items-center justify-between gap-[8px] w-full min-w-0">
        <p className="font-['Inter:Regular',sans-serif] text-[#075ce5] text-[12px] min-w-0">
          {nomeCategoria} · {METADADOS_STATUS[ocorrencia.status].label}
        </p>
        <span className={"flex items-center gap-[4px] px-[8px] py-[3px] rounded-[999px] shrink-0 " + cor.bg}>
          <span aria-hidden className={"size-[5px] rounded-full shrink-0 " + cor.dot} />
          <span className={"font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] whitespace-nowrap " + cor.text}>
            {labelRelevancia[relevancia]}
          </span>
        </span>
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px] w-full">
        {tituloEvento}
      </p>
      <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[16px] w-full">
        {ocorrencia.titulo}
      </p>
      <p className="font-['Inter:Regular',sans-serif] text-[#586a80] text-[12px] w-full">
        {ocorrencia.bairro} · {ocorrencia.endereco}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-[8px] w-full text-[#586a80] text-[12px] font-['Inter:Regular',sans-serif]">
        <span>{ocorrencia.quantidadeConfirmacoes} confirmações</span>
        <time dateTime={evento.criadoEm}>{dataHora}</time>
      </div>
    </button>
  );
}

export default function Atividade({
  activeTab,
  onNavigate,
  onOpenDetalhe,
  categorias,
  categoriasLoading,
}: Props) {
  const { user } = useAuth();
  const usuarioId = user?.id ?? null;
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [estado, setEstado] = useState<{
    usuarioId: string | null;
    itens: AtividadeOficial[];
    carregando: boolean;
    erro: boolean;
  }>({ usuarioId: null, itens: [], carregando: true, erro: false });

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    setEstado({ usuarioId, itens: [], carregando: true, erro: false });

    void listarAtividadesOficiais().then(itens => {
      if (ativo) setEstado({ usuarioId, itens, carregando: false, erro: false });
    }).catch(error => {
      console.error("Não foi possível carregar as atividades.", error);
      if (ativo) setEstado({ usuarioId, itens: [], carregando: false, erro: true });
    });

    return () => { ativo = false; };
  }, [usuarioId]);

  const carregando = !usuarioId || estado.usuarioId !== usuarioId || estado.carregando;
  const erro = !carregando && estado.erro;
  const filtradas = !carregando && !erro
    ? filtrarPeriodo(estado.itens, periodo, new Date())
    : [];
  // O histórico cronológico conserva todos os eventos. A coluna de relevância resume
  // cada ocorrência pelo seu evento mais recente no período, com relevância atual.
  const vistos = new Set<string>();
  const porRelevancia = filtradas.filter(item => {
    if (vistos.has(item.ocorrencia.id)) return false;
    vistos.add(item.ocorrencia.id);
    return true;
  }).sort((a, b) =>
    b.ocorrencia.quantidadeConfirmacoes - a.ocorrencia.quantidadeConfirmacoes ||
    new Date(b.evento.criadoEm).getTime() - new Date(a.evento.criadoEm).getTime() ||
    b.evento.id.localeCompare(a.evento.id)
  );

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content layout-atividade content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

          <div className="activity-intro [word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[22px] w-full">Atividade</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Acompanhe atualizações e histórico das ocorrências.</p>
          </div>

          <div className="activity-period content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[13px] w-full">Filtre por período</p>
            <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full">
              {PERIODOS.map(opcao => (
                <button
                  key={opcao.valor}
                  type="button"
                  aria-pressed={periodo === opcao.valor}
                  onClick={() => setPeriodo(opcao.valor)}
                  className={"px-[12px] py-[8px] rounded-[999px] text-[13px] leading-[1.45] cursor-pointer " +
                    (periodo === opcao.valor
                      ? "bg-[#075ce5] text-white font-['Inter:Bold',sans-serif] font-bold"
                      : "bg-white text-[#10284a] border border-[#d7e3f0] font-['Inter:Semi_Bold',sans-serif] font-semibold")}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>

          {carregando ? (
            <p role="status" className="col-span-full text-[#586a80] text-[14px]">Carregando atividades...</p>
          ) : erro ? (
            <p role="alert" className="col-span-full text-[#10284a] text-[14px]">Não foi possível carregar as atividades agora.</p>
          ) : filtradas.length === 0 ? (
            <p role="status" className="col-span-full text-[#586a80] text-[14px]">Nenhuma atualização neste período.</p>
          ) : (
            <>
              <div className="activity-recent content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
                  <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Atualizações recentes</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Eventos oficiais no período, dos mais novos aos mais antigos.</p>
                </div>
                {filtradas.map(item => (
                  <CartaoAtividade key={item.evento.id} item={item} categorias={categorias}
                    categoriasLoading={categoriasLoading} onOpenDetalhe={onOpenDetalhe} />
                ))}
              </div>

              <div className="activity-history content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
                  <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[18px] w-full">Histórico por relevância</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Uma ocorrência por card, ordenada pelas confirmações atuais.</p>
                </div>
                {porRelevancia.map(item => (
                  <CartaoAtividade key={item.ocorrencia.id} item={item} categorias={categorias}
                    categoriasLoading={categoriasLoading} onOpenDetalhe={onOpenDetalhe} />
                ))}
              </div>
            </>
          )}

          <div className="activity-action bg-[#075ce5] relative rounded-[20px] shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start p-[16px] relative size-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[10px] text-white w-full">NOVO PROBLEMA</p>
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[16px] text-white w-full">Registrar uma nova ocorrência</p>
              <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.45] not-italic relative shrink-0 text-[12px] text-white w-full">Compartilhe fotos, localização e detalhes para ajudar a equipe a priorizar.</p>
              <button type="button" className="bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90 p-[14px]"
                onClick={() => onNavigate("nova")}>
                <span className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[14px] text-center w-full">Registrar problema</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
