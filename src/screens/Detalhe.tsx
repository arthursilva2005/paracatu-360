import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Ocorrencia, calcularRelevancia, corRelevancia, labelRelevancia, METADADOS_STATUS, localOcorrencia, tempoOcorrencia } from "@/data/ocorrencias";
import { CategoriaOcorrencia, resolverCategoria } from "@/hooks/useCategorias";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";
import GaleriaOcorrencia from "@/components/GaleriaOcorrencia";
import { useAuth } from "@/context/AuthContext";
import { buscarOcorrenciaPorId, ehUuidOcorrencia, type DetalheOcorrencia } from "@/lib/ocorrencias";
import type { FotoOcorrenciaLeitura } from "@/lib/fotosOcorrencias";
import { buscarMinhaConfirmacao, buscarEstadoConfirmacao, confirmarOcorrencia, desfazerConfirmacao, mensagemErroConfirmacao, sessaoConfirmacaoExpirada } from "@/lib/confirmacoes";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onBack: () => void;
  id: string;
  ocorrenciaMock?: Ocorrencia;
  categorias: CategoriaOcorrencia[];
  categoriasLoading: boolean;
  confirmadoPorMim: boolean;
  onConfirmar: (id: string) => void;
};

type EstadoDetalhe =
  | { status: "carregando" | "erro" | "nao-encontrado" }
  | { status: "pronto"; dados: DetalheOcorrencia; usuarioId: string | null };

export default function Detalhe(props: Props) {
  const real = ehUuidOcorrencia(props.id);
  const { user, loading } = useAuth();
  const usuarioId = user?.id ?? null;
  const [estado, setEstado] = useState<EstadoDetalhe>({ status: "carregando" });

  useEffect(() => {
    if (!real || loading) return;
    let ativo = true;
    setEstado({ status: "carregando" });
    void buscarOcorrenciaPorId(props.id).then(dados => {
      if (ativo) setEstado(dados ? { status: "pronto", dados, usuarioId } : { status: "nao-encontrado" });
    }).catch(() => {
      if (ativo) setEstado({ status: "erro" });
    });
    return () => { ativo = false; };
  }, [props.id, real, loading, usuarioId]);

  const aguardando = real && (loading || estado.status === "carregando" ||
    (estado.status === "pronto" && estado.usuarioId !== usuarioId));
  const ocorrencia = real
    ? (!aguardando && estado.status === "pronto" ? estado.dados.ocorrencia : undefined)
    : props.ocorrenciaMock;

  if (!ocorrencia) {
    const erro = real && !aguardando && estado.status === "erro";
    return (
      <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
        <Cabecalho />
        <div className="screen-scroll flex-1 overflow-y-auto w-full">
          <div className="screen-content flex flex-col gap-[16px] p-[22px] w-full">
            <p role={erro ? "alert" : "status"} className="text-[#10284a] text-[16px]">
              {aguardando ? "Carregando ocorrência..." : erro
                ? "Não foi possível carregar esta ocorrência agora." : "Ocorrência não encontrada."}
            </p>
            <button onClick={() => props.onNavigate("inicio")}
              className="self-start bg-[#075ce5] text-white rounded-[12px] px-[16px] py-[12px] cursor-pointer">
              Voltar para o início
            </button>
          </div>
        </div>
        <Navegacao activeTab={props.activeTab} onNavigate={props.onNavigate} />
      </div>
    );
  }

  return <ConteudoDetalhe key={`${props.id}:${usuarioId ?? "anon"}`} {...props} ocorrencia={ocorrencia} real={real}
    confirmadoPorMim={!real && props.confirmadoPorMim}
    fotos={real && estado.status === "pronto" ? estado.dados.fotos : []} />;
}

function useConfirmacaoReal(ocorrencia: Ocorrencia, real: boolean) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const usuarioId = user?.id;
  const id = ocorrencia.id;
  const [confirmacaoId, setConfirmacaoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(ocorrencia.quantidadeConfirmacoes);
  const [fase, setFase] = useState<"carregando" | "pronto" | "confirmando" | "desfazendo" | "erro">(
    real && usuarioId ? "carregando" : "pronto",
  );
  const [mensagem, setMensagem] = useState("");
  const [precisaEntrar, setPrecisaEntrar] = useState(false);
  const operando = useRef(false);
  const geracao = useRef(0);

  async function carregar(inicial: boolean, versao: number) {
    if (!real || !usuarioId || operando.current) return;
    operando.current = true;
    setFase("carregando");
    setMensagem("");
    try {
      // O Detalhe já carregou a contagem inicial; não a consulta duas vezes.
      const dados = inicial
        ? { confirmacaoId: await buscarMinhaConfirmacao(id), quantidade: ocorrencia.quantidadeConfirmacoes }
        : await buscarEstadoConfirmacao(id);
      if (geracao.current !== versao) return;
      setConfirmacaoId(dados.confirmacaoId);
      setQuantidade(dados.quantidade);
      setFase("pronto");
      setPrecisaEntrar(false);
    } catch (error) {
      if (geracao.current !== versao) return;
      setFase("erro");
      setPrecisaEntrar(sessaoConfirmacaoExpirada(error));
      setMensagem(sessaoConfirmacaoExpirada(error) ? mensagemErroConfirmacao(error)
        : "Não foi possível consultar sua confirmação. Tente novamente.");
    } finally {
      if (geracao.current === versao) operando.current = false;
    }
  }

  useEffect(() => {
    const versao = ++geracao.current;
    void carregar(true, versao);
    const atualizarAoRetornar = () => {
      if (document.visibilityState === "visible") void carregar(false, versao);
    };
    window.addEventListener("focus", atualizarAoRetornar);
    document.addEventListener("visibilitychange", atualizarAoRetornar);
    return () => {
      ++geracao.current;
      operando.current = false;
      window.removeEventListener("focus", atualizarAoRetornar);
      document.removeEventListener("visibilitychange", atualizarAoRetornar);
    };
  }, [id, real, usuarioId]);

  async function alterar() {
    if (!real || operando.current) return;
    if (!usuarioId) {
      navigate("/entrar", { state: { from: `/ocorrencias/${id}` } });
      return;
    }
    const versao = geracao.current;
    if (precisaEntrar) {
      operando.current = true;
      setFase("carregando");
      try {
        const { error } = await signOut();
        if (error) throw error;
        navigate("/entrar", { state: { from: `/ocorrencias/${id}` } });
      } catch {
        if (geracao.current === versao) {
          setFase("erro");
          setMensagem("Não foi possível renovar o acesso. Tente entrar novamente.");
        }
      } finally {
        if (geracao.current === versao) operando.current = false;
      }
      return;
    }
    if (fase === "erro") {
      await carregar(false, versao);
      return;
    }
    operando.current = true;
    const desfazendo = confirmacaoId !== null;
    setFase(desfazendo ? "desfazendo" : "confirmando");
    setMensagem("");
    let falha: unknown;
    try {
      if (confirmacaoId) await desfazerConfirmacao(id, confirmacaoId, usuarioId);
      else await confirmarOcorrencia(id, usuarioId);
    } catch (error) {
      falha = error;
    }

    // Relê inclusive após conflito, zero linhas ou resposta perdida na rede.
    // Nenhuma contagem ou confirmação é aplicada de forma otimista.
    try {
      if (geracao.current !== versao) return;
      const dados = await buscarEstadoConfirmacao(id);
      if (geracao.current !== versao) return;
      setConfirmacaoId(dados.confirmacaoId);
      setQuantidade(dados.quantidade);
      setFase("pronto");
      setPrecisaEntrar(false);
      const resultadoEsperado = desfazendo ? dados.confirmacaoId === null : dados.confirmacaoId !== null;
      setMensagem(resultadoEsperado
        ? (desfazendo ? "Sua confirmação foi removida." : "")
        : falha ? mensagemErroConfirmacao(falha, desfazendo)
          : "O estado mudou durante a operação. Sua confirmação foi atualizada.");
    } catch (error) {
      if (geracao.current !== versao) return;
      setFase("erro");
      setPrecisaEntrar(sessaoConfirmacaoExpirada(falha) || sessaoConfirmacaoExpirada(error));
      setMensagem(falha ? mensagemErroConfirmacao(falha, desfazendo)
        : sessaoConfirmacaoExpirada(error) ? mensagemErroConfirmacao(error)
          : "Não foi possível atualizar sua confirmação. Consulte novamente antes de repetir a ação.");
    } finally {
      if (geracao.current === versao) operando.current = false;
    }
  }

  return { confirmacaoId, quantidade, fase, mensagem, precisaEntrar, alterar };
}

function ConteudoDetalhe({ activeTab, onNavigate, onBack, ocorrencia, categorias, categoriasLoading, onConfirmar, confirmadoPorMim, real, fotos }: Props & {
  ocorrencia: Ocorrencia; real: boolean; fotos: FotoOcorrenciaLeitura[];
}) {
  const confirmacao = useConfirmacaoReal(ocorrencia, real);
  const quantidade = real ? confirmacao.quantidade : ocorrencia.quantidadeConfirmacoes;
  const confirmado = real ? confirmacao.fase === "pronto" && confirmacao.confirmacaoId !== null : confirmadoPorMim;
  const ocupado = real && ["carregando", "confirmando", "desfazendo"].includes(confirmacao.fase);
  const textoAcao = confirmacao.fase === "carregando" ? "Consultando confirmação..."
    : confirmacao.fase === "confirmando" ? "Confirmando..."
    : confirmacao.fase === "desfazendo" ? "Removendo confirmação..."
    : confirmacao.precisaEntrar ? "Entrar novamente"
    : confirmacao.fase === "erro" ? "Consultar novamente"
    : confirmado ? "Desfazer confirmação" : "Também encontrei este problema";
  const relevancia = calcularRelevancia(quantidade);
  const categoria = resolverCategoria(ocorrencia.categoriaId, categorias);
  const categoriaNome = categoria?.nome
    ?? (categoriasLoading ? "Carregando categoria" : "Categoria indisponível");
  const cor = corRelevancia[relevancia];
  const progresso = Math.min(100, Math.round((quantidade / 50) * 100));

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />

      {/* Barra de volta */}
      <div className="bg-white w-full px-[16px] py-[10px] flex items-center gap-[8px] border-b border-[#e8eef5]">
        <button
          onClick={onBack}
          className="flex items-center gap-[6px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[7px] border-none outline-none cursor-pointer active:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[13px]">Voltar</p>
        </button>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] ml-[4px]">Detalhes da ocorrência</p>
      </div>

      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className={`screen-content layout-detalhe content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full ${real ? "[overflow-wrap:anywhere]" : ""}`}>

          {/* Título */}
          <div className="detail-title flex flex-col gap-[8px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[10px] tracking-widest">
              OCORRÊNCIA · {categoriaNome.toUpperCase()}
            </p>
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px] leading-snug w-full">
              {ocorrencia.titulo}
            </p>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
              {localOcorrencia(ocorrencia)}
            </p>
          </div>

          {/* Card resumo */}
          <div className="detail-summary bg-white rounded-[16px] w-full border border-[#e8eef5]">
            <div className="flex flex-col gap-[14px] p-[16px]">

              {real && <GaleriaOcorrencia fotos={fotos} titulo={ocorrencia.titulo} />}

              {/* Status + relevância */}
              <div className={`flex items-center justify-between w-full gap-[8px] ${real ? "flex-wrap" : ""}`}>
                <span className={`${METADADOS_STATUS[ocorrencia.status]?.classeBg ?? "bg-[#586a80]"} px-[10px] py-[5px] rounded-[999px]`}>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[12px]">{METADADOS_STATUS[ocorrencia.status].label}</p>
                </span>
                <div className={`flex items-center gap-[5px] px-[10px] py-[5px] rounded-[999px] ${cor.bg}`}>
                  <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${cor.dot}`} />
                  <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] ${cor.text}`}>
                    {labelRelevancia[relevancia]}
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="flex flex-col gap-[6px] w-full">
                <div className="flex items-center justify-between">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">
                    {quantidade} confirmações
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
                    {progresso}% da meta
                  </p>
                </div>
                <div className="w-full bg-[#f3f6fa] rounded-full h-[7px] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      relevancia === "alta" ? "bg-[#dc2626]" :
                      relevancia === "media" ? "bg-[#d97706]" : "bg-[#075ce5]"
                    }`}
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px]">
                  Meta: 50 confirmações para prioridade máxima
                </p>
              </div>

              {/* Descrição */}
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[13px] leading-relaxed w-full">
                {ocorrencia.descricao}
              </p>

              {/* Informações */}
              <div className="flex flex-col gap-[10px] w-full pt-[4px] border-t border-[#f3f6fa]">
                {[
                  { label: "Categoria", value: categoriaNome },
                  { label: "Local", value: localOcorrencia(ocorrencia) },
                  { label: "Registrado", value: real ? new Date(ocorrencia.criadoEm).toLocaleDateString("pt-BR") : tempoOcorrencia(ocorrencia) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">{label}</p>
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Atualizações */}
          {!real && <div className="detail-updates flex flex-col gap-[12px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Atualizações</p>
            {[
              { titulo: "Encaminhado para manutenção", tempo: "Há 2 dias", texto: "A ocorrência foi enviada para a equipe de infraestrutura urbana e está em análise para agendamento do reparo." },
              { titulo: `${ocorrencia.quantidadeConfirmacoes} confirmações recebidas`, tempo: "Há 3 dias", texto: "Moradores confirmaram a ocorrência. A equipe iniciou o levantamento do local para priorização." },
            ].map((a, i) => (
              <div key={i} className="bg-white rounded-[16px] border border-[#e8eef5] p-[16px] flex flex-col gap-[8px]">
                <div className="flex items-start justify-between gap-[8px]">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px] flex-1">{a.titulo}</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px] shrink-0 mt-[1px]">{a.tempo}</p>
                </div>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] leading-relaxed">{a.texto}</p>
              </div>
            ))}
          </div>}

          {/* Ações */}
          <div className="detail-actions flex flex-col gap-[12px] w-full pb-[8px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Ações</p>
            <div className="flex gap-[12px] w-full">
              <button
                onClick={() => real ? void confirmacao.alterar() : !confirmadoPorMim && onConfirmar(ocorrencia.id)}
                disabled={real ? ocupado : confirmadoPorMim}
                aria-busy={ocupado}
                className={`flex-1 rounded-[16px] py-[14px] px-[8px] border-none outline-none cursor-pointer transition-all duration-150 active:scale-[0.98] flex flex-col items-center gap-[4px] ${
                  ocupado ? "bg-[#075ce5] opacity-60 cursor-not-allowed" : confirmado
                    ? (real ? "bg-[#e8f0fe]" : "bg-[#e8f0fe] cursor-default")
                    : "bg-[#075ce5] hover:bg-[#0a47b8]"
                }`}
              >
                {real ? (
                  <p className={`font-['Inter:Bold',sans-serif] font-bold text-[13px] ${confirmado ? "text-[#075ce5]" : "text-white"}`}>
                    {textoAcao}
                  </p>
                ) : confirmadoPorMim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[13px]">Confirmado</p>
                  </>
                ) : (
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[14px]">Confirmar problema</p>
                )}
              </button>

              <button className="flex-1 rounded-[16px] py-[14px] bg-white border border-[#d7e3f0] outline-none cursor-pointer active:opacity-80 transition-opacity">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Compartilhar</p>
              </button>
            </div>

            {real && confirmacao.mensagem && <p role="status" className="text-[#586a80] text-[12px]">{confirmacao.mensagem}</p>}

            {confirmado && (
              <div className="bg-[#e8f0fe] rounded-[12px] px-[14px] py-[10px] w-full">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[12px] text-center">
                  {real ? "Você confirmou este problema." : "Obrigado! Sua confirmação ajuda a priorizar esta ocorrência."}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
