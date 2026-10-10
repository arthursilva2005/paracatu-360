import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Cabecalho from "@/components/Cabecalho";
import GaleriaOcorrencia from "@/components/GaleriaOcorrencia";
import Navegacao, { type TabName } from "@/components/Navegacao";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import { useAuth } from "@/context/AuthContext";
import { calcularRelevancia, labelRelevancia, METADADOS_STATUS, type StatusOcorrencia } from "@/data/ocorrencias";
import type { EstadoCategorias } from "@/hooks/useCategorias";
import { resolverCategoria } from "@/hooks/useCategorias";
import { buscarHistoricoAdministrativo, type HistoricoAdministrativoOcorrencia } from "@/lib/historicoOcorrencias";
import { alterarStatusOcorrencia, exigeJustificativa, mensagemErroModeracao, proximosStatus } from "@/lib/moderacao";
import { buscarOcorrenciaPorId, ehUuidOcorrencia, listarOcorrenciasEquipe, type DetalheOcorrencia, type OcorrenciaHome } from "@/lib/ocorrencias";

const STATUS: StatusOcorrencia[] = [
  "registrado", "em_analise", "encaminhado", "em_andamento",
  "resolvido", "rejeitado", "duplicado", "arquivado",
];
const POR_PAGINA = 20;
type Ordem = "recente" | "relevancia" | "antiga";
type Props = EstadoCategorias & {
  id?: string;
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
};

export default function Moderacao(props: Props) {
  const navigate = useNavigate();
  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content flex flex-col gap-[18px] px-[18px] py-[22px] w-full max-w-[1240px]">
          {props.id ? <DetalheAdministrativo key={props.id} id={props.id} {...props}
            onVoltar={() => navigate("/moderacao")} /> : <ListaAdministrativa {...props} />}
        </div>
      </div>
      <Navegacao activeTab={props.activeTab} onNavigate={props.onNavigate} />
    </div>
  );
}

function ListaAdministrativa({ categorias, categoriasLoading, categoriasError, onOpenDetalhe }: Props) {
  const [lista, setLista] = useState<OcorrenciaHome[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [status, setStatus] = useState<StatusOcorrencia | "">("registrado");
  const [categoria, setCategoria] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recente");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    void listarOcorrenciasEquipe().then(resultado => {
      if (ativo) setLista(resultado);
    }).catch(() => {
      if (ativo) setErro(true);
    }).finally(() => {
      if (ativo) setCarregando(false);
    });
    return () => { ativo = false; };
  }, []);

  const filtradas = lista.filter(o => (!status || o.status === status) &&
    (!categoria || o.categoriaId === categoria));
  const ordenadas = [...filtradas].sort((a, b) => {
    if (ordem === "relevancia") return b.quantidadeConfirmacoes - a.quantidadeConfirmacoes ||
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    const diferenca = new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    return ordem === "recente" ? diferenca : -diferenca;
  });
  const paginas = Math.ceil(ordenadas.length / POR_PAGINA);
  const paginaAtual = Math.min(pagina, Math.max(1, paginas));
  const visiveis = ordenadas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const filtroClasse = "w-full min-w-0 rounded-[12px] border border-[#d7e3f0] bg-white px-[12px] py-[11px] text-[13px] text-[#10284a]";

  return <>
    <header className="min-w-0">
      <h1 className="text-[#10284a] text-[24px] font-bold">Moderação</h1>
      <p className="text-[#586a80] text-[13px]">Acompanhe os relatos e as decisões oficiais.</p>
    </header>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] w-full">
      <label className="min-w-0 text-[#586a80] text-[12px] flex flex-col gap-[5px]">Status
        <select className={filtroClasse} value={status} onChange={e => { setStatus(e.target.value as StatusOcorrencia | ""); setPagina(1); }}>
          <option value="">Todos</option>
          {STATUS.map(item => <option key={item} value={item}>{METADADOS_STATUS[item].label}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-[#586a80] text-[12px] flex flex-col gap-[5px]">Categoria
        <select className={filtroClasse} value={categoria} onChange={e => { setCategoria(e.target.value); setPagina(1); }}>
          <option value="">Todas</option>
          {categorias.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-[#586a80] text-[12px] flex flex-col gap-[5px]">Ordenação
        <select className={filtroClasse} value={ordem} onChange={e => { setOrdem(e.target.value as Ordem); setPagina(1); }}>
          <option value="recente">Mais recentes</option>
          <option value="relevancia">Mais relevantes</option>
          <option value="antiga">Mais antigas</option>
        </select>
      </label>
    </div>
    {categoriasLoading && <p role="status" className="text-[#586a80] text-[12px]">Carregando categorias...</p>}
    {categoriasError && <p role="alert" className="text-[#586a80] text-[12px]">{categoriasError}</p>}
    {carregando ? <p role="status" className="rounded-[16px] bg-white p-[20px] text-[#586a80]">Carregando ocorrências...</p>
      : erro ? <p role="alert" className="rounded-[16px] bg-white p-[20px] text-[#586a80]">Não foi possível carregar as ocorrências para moderação.</p>
      : visiveis.length === 0 ? <p className="rounded-[16px] bg-white p-[20px] text-[#586a80]">Nenhuma ocorrência encontrada para estes filtros.</p>
      : <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] w-full min-w-0">
          {visiveis.map(o => <button key={o.id} type="button" className="w-full min-w-0 text-left cursor-pointer"
            aria-label={`Abrir ${o.titulo}`} onClick={() => onOpenDetalhe(o.id)}>
            <OcorrenciaCard ocorrencia={o} categorias={categorias} categoriasLoading={categoriasLoading}
              exibirFoto fotoPrincipalUrl={o.fotoPrincipalUrl} />
          </button>)}
        </div>}
    {!carregando && !erro && paginas > 1 && <nav aria-label="Páginas de ocorrências" className="flex items-center justify-center gap-[12px] flex-wrap">
      <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}
        className="rounded-[10px] bg-white px-[14px] py-[10px] text-[#075ce5] disabled:opacity-50">Anterior</button>
      <span className="text-[#586a80] text-[13px]">{paginaAtual} de {paginas}</span>
      <button type="button" disabled={paginaAtual === paginas} onClick={() => setPagina(paginaAtual + 1)}
        className="rounded-[10px] bg-white px-[14px] py-[10px] text-[#075ce5] disabled:opacity-50">Próxima</button>
    </nav>}
  </>;
}

type DetalheProps = Props & { id: string; onVoltar: () => void };
function DetalheAdministrativo({ id, onVoltar, categorias, categoriasLoading }: DetalheProps) {
  const { profile } = useAuth();
  const [dados, setDados] = useState<DetalheOcorrencia | null>(null);
  const [historico, setHistorico] = useState<HistoricoAdministrativoOcorrencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [historicoCarregando, setHistoricoCarregando] = useState(true);
  const [historicoErro, setHistoricoErro] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusOcorrencia | "">("");
  const [justificativa, setJustificativa] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const operando = useRef(false);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setHistoricoCarregando(true);
    setErro(false);
    setHistoricoErro(false);
    const [resultadoDetalhe, resultadoHistorico] = await Promise.allSettled([
      buscarOcorrenciaPorId(id), buscarHistoricoAdministrativo(id),
    ]);
    if (resultadoDetalhe.status === "fulfilled" && resultadoDetalhe.value) {
      setDados(resultadoDetalhe.value);
      setNovoStatus("");
      setJustificativa("");
    } else {
      setDados(null);
      setErro(true);
    }
    if (resultadoHistorico.status === "fulfilled") setHistorico(resultadoHistorico.value);
    else { setHistorico([]); setHistoricoErro(true); }
    setCarregando(false);
    setHistoricoCarregando(false);
  }, [id]);

  useEffect(() => { void recarregar(); }, [recarregar]);

  const ocorrencia = dados?.ocorrencia;
  const opcoes = ocorrencia && profile ? proximosStatus(ocorrencia.status, profile.papel) : [];
  const obrigatoria = ocorrencia && novoStatus ? exigeJustificativa(ocorrencia.status, novoStatus) : false;
  const campoClasse = "w-full min-w-0 rounded-[12px] border border-[#d7e3f0] bg-white px-[12px] py-[11px] text-[13px] text-[#10284a]";

  async function alterarStatus() {
    if (!ocorrencia || !novoStatus || operando.current) return;
    const texto = justificativa.trim();
    if (obrigatoria && !texto) {
      setMensagem("Informe uma justificativa pública para esta alteração.");
      return;
    }
    if (texto.length > 500) {
      setMensagem("A justificativa pública deve ter no máximo 500 caracteres.");
      return;
    }
    operando.current = true;
    setSalvando(true);
    setMensagem("");
    try {
      await alterarStatusOcorrencia(ocorrencia.id, ocorrencia.status, novoStatus, texto || null);
      await recarregar();
      setMensagem("Status atualizado. A justificativa pública foi registrada no histórico quando informada.");
    } catch (error) {
      const codigo = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
      if (codigo === "P3604") await recarregar();
      setMensagem(mensagemErroModeracao(error));
    } finally {
      operando.current = false;
      setSalvando(false);
    }
  }

  const relevancia = ocorrencia ? calcularRelevancia(ocorrencia.quantidadeConfirmacoes) : null;
  return <>
    <button type="button" onClick={onVoltar} className="self-start text-[#075ce5] text-[13px] font-semibold cursor-pointer">← Voltar à moderação</button>
    {carregando ? <p role="status" className="rounded-[16px] bg-white p-[20px] text-[#586a80]">Carregando ocorrência...</p>
      : erro || !ocorrencia ? <p role="alert" className="rounded-[16px] bg-white p-[20px] text-[#586a80]">Não foi possível carregar esta ocorrência.</p>
      : <>
        <header className="min-w-0">
          <p className="text-[#075ce5] text-[11px] font-semibold uppercase">Relato original · somente leitura</p>
          <h1 className="text-[#10284a] text-[24px] font-bold [overflow-wrap:anywhere]">{ocorrencia.titulo}</h1>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px] w-full min-w-0 items-start">
          <section className="min-w-0 bg-white rounded-[16px] border border-[#e8eef5] p-[16px] flex flex-col gap-[12px]">
            <GaleriaOcorrencia fotos={dados?.fotos ?? []} titulo={ocorrencia.titulo} />
            <p className="text-[#10284a] text-[14px] leading-relaxed [overflow-wrap:anywhere]">{ocorrencia.descricao}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] text-[13px]">
              <div><dt className="text-[#586a80]">Categoria</dt><dd className="text-[#10284a] font-semibold">{resolverCategoria(ocorrencia.categoriaId, categorias)?.nome ?? (categoriasLoading ? "Carregando categoria..." : "Categoria indisponível")}</dd></div>
              <div><dt className="text-[#586a80]">Status</dt><dd className="text-[#10284a] font-semibold">{METADADOS_STATUS[ocorrencia.status].label}</dd></div>
              <div><dt className="text-[#586a80]">Relevância</dt><dd className="text-[#10284a] font-semibold">{relevancia && labelRelevancia[relevancia]}</dd></div>
              <div><dt className="text-[#586a80]">Confirmações</dt><dd className="text-[#10284a] font-semibold">{ocorrencia.quantidadeConfirmacoes}</dd></div>
              <div><dt className="text-[#586a80]">Bairro</dt><dd className="text-[#10284a] font-semibold [overflow-wrap:anywhere]">{ocorrencia.bairro}</dd></div>
              <div><dt className="text-[#586a80]">Endereço</dt><dd className="text-[#10284a] font-semibold [overflow-wrap:anywhere]">{ocorrencia.endereco}</dd></div>
              <div><dt className="text-[#586a80]">Localização</dt><dd className="text-[#10284a] font-semibold">{ocorrencia.latitude != null && ocorrencia.longitude != null ? `${ocorrencia.latitude}, ${ocorrencia.longitude}` : "Não informada"}</dd></div>
              <div><dt className="text-[#586a80]">Registrado em</dt><dd className="text-[#10284a] font-semibold">{new Date(ocorrencia.criadoEm).toLocaleString("pt-BR")}</dd></div>
            </dl>
          </section>
          <div className="min-w-0 flex flex-col gap-[16px]">
            <section className="min-w-0 bg-white rounded-[16px] border border-[#e8eef5] p-[16px] flex flex-col gap-[12px]">
              <h2 className="text-[#10284a] text-[18px] font-bold">Alterar status</h2>
              {opcoes.length ? <>
                <label className="text-[#586a80] text-[13px] flex flex-col gap-[6px]">Novo status
                  <select className={campoClasse} value={novoStatus} disabled={salvando}
                    onChange={e => { setNovoStatus(e.target.value as StatusOcorrencia | ""); setMensagem(""); }}>
                    <option value="">Selecione</option>
                    {opcoes.map(item => <option key={item} value={item}>{METADADOS_STATUS[item].label}</option>)}
                  </select>
                </label>
                <label className="text-[#586a80] text-[13px] flex flex-col gap-[6px]">Justificativa pública {obrigatoria ? "(obrigatória)" : "(opcional)"}
                  <textarea className={`${campoClasse} min-h-[100px] resize-y`} value={justificativa}
                    maxLength={500} disabled={salvando} onChange={e => setJustificativa(e.target.value)} />
                </label>
                <p className="text-[#586a80] text-[12px]">Esta justificativa será pública. {justificativa.length}/500 caracteres.</p>
                <button type="button" disabled={!novoStatus || salvando || (obrigatoria && !justificativa.trim())}
                  onClick={() => void alterarStatus()}
                  className="self-start rounded-[12px] bg-[#075ce5] px-[18px] py-[12px] text-white text-[13px] font-semibold disabled:opacity-50 cursor-pointer">
                  {salvando ? "Atualizando..." : "Confirmar alteração"}
                </button>
              </> : <p className="text-[#586a80] text-[13px]">Nenhuma transição disponível para este status.</p>}
              {mensagem && <p role="status" className="text-[#586a80] text-[13px]">{mensagem}</p>}
            </section>
            <section className="min-w-0 bg-white rounded-[16px] border border-[#e8eef5] p-[16px] flex flex-col gap-[12px]">
              <h2 className="text-[#10284a] text-[18px] font-bold">Histórico oficial</h2>
              {historicoCarregando ? <p role="status" className="text-[#586a80] text-[13px]">Carregando histórico...</p>
                : historicoErro ? <p role="alert" className="text-[#586a80] text-[13px]">Não foi possível carregar o histórico.</p>
                : historico.length === 0 ? <p className="text-[#586a80] text-[13px]">Ainda não há atualizações.</p>
                : <ol className="flex flex-col gap-[10px]">
                  {historico.map(item => <li key={item.id} className="border-l-[3px] border-[#075ce5] pl-[12px] [overflow-wrap:anywhere]">
                    <p className="text-[#10284a] text-[13px] font-semibold">{item.statusAnterior ? `${METADADOS_STATUS[item.statusAnterior].label} → ` : ""}{METADADOS_STATUS[item.statusNovo].label}</p>
                    <p className="text-[#586a80] text-[12px]">{new Date(item.criadoEm).toLocaleString("pt-BR")}</p>
                    {item.observacao && <p className="text-[#586a80] text-[12px] mt-[5px]">Justificativa pública: {item.observacao}</p>}
                  </li>)}
                </ol>}
            </section>
          </div>
        </div>
      </>}
  </>;
}
