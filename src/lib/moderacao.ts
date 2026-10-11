import type { StatusOcorrencia } from "@/data/ocorrencias";
import type { PapelUsuario } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const TRANSICOES_COMUNS: Partial<Record<StatusOcorrencia, StatusOcorrencia[]>> = {
  registrado: ["em_analise"],
  em_analise: ["encaminhado", "rejeitado"],
  encaminhado: ["em_andamento", "rejeitado"],
  em_andamento: ["resolvido", "rejeitado"],
  resolvido: ["arquivado"],
  rejeitado: ["arquivado"],
  duplicado: ["arquivado"],
};

const TRANSICOES_ADMIN: Partial<Record<StatusOcorrencia, StatusOcorrencia[]>> = {
  resolvido: ["em_analise"],
  rejeitado: ["em_analise"],
  duplicado: ["em_analise"],
  arquivado: ["em_analise"],
  encaminhado: ["em_analise"],
  em_andamento: ["encaminhado"],
};

export function proximosStatus(status: StatusOcorrencia, papel: PapelUsuario): StatusOcorrencia[] {
  return [...(TRANSICOES_COMUNS[status] ?? []),
    ...(papel === "administrador" ? TRANSICOES_ADMIN[status] ?? [] : [])];
}

export function exigeJustificativa(statusAtual: StatusOcorrencia, novoStatus: StatusOcorrencia): boolean {
  return novoStatus === "rejeitado" || novoStatus === "arquivado" ||
    (TRANSICOES_ADMIN[statusAtual] ?? []).includes(novoStatus);
}

export type ResultadoAlteracaoStatus = {
  id: string;
  status: StatusOcorrencia;
  updated_at: string;
  resolvida_at: string | null;
  arquivada_at: string | null;
  ocorrencia_principal_id: string | null;
};

export type CandidatoPrincipal = {
  id: string;
  categoriaId: string;
  titulo: string;
  status: StatusOcorrencia;
  bairro: string;
  endereco: string;
  criadoEm: string;
  ocorrenciaPrincipalId: string | null;
};

type CandidatoBanco = {
  id: string;
  categoria_id: string;
  titulo: string;
  status: StatusOcorrencia;
  bairro: string;
  endereco: string;
  created_at: string;
  ocorrencia_principal_id: string | null;
};

export const CANDIDATOS_POR_PAGINA = 10;

export async function buscarPrincipaisDuplicidade(
  origemId: string,
  termo: string,
  categoriaId: string,
  pagina: number,
): Promise<{ candidatos: CandidatoPrincipal[]; total: number }> {
  // A sintaxe de filtros OR do PostgREST usa pontuação como separador.
  // Reduzimos a entrada a texto pesquisável antes de compor o filtro.
  const busca = termo.trim().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  if (termo.trim() && !busca) throw new Error("Use letras ou números para buscar.");

  let consulta = supabase.from("ocorrencias")
    .select("id, categoria_id, titulo, status, bairro, endereco, created_at, ocorrencia_principal_id", { count: "exact" })
    .in("status", ["em_analise", "encaminhado", "em_andamento", "resolvido"])
    .is("ocorrencia_principal_id", null)
    .neq("id", origemId);

  if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);
  if (busca) consulta = consulta.or(`titulo.ilike.%${busca}%,bairro.ilike.%${busca}%`);

  const inicio = (pagina - 1) * CANDIDATOS_POR_PAGINA;
  const { data, count, error } = await consulta
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(inicio, inicio + CANDIDATOS_POR_PAGINA - 1)
    .returns<CandidatoBanco[]>();
  if (error) throw error;
  if (count === null) throw new Error("Contagem de resultados indisponível.");

  return {
    candidatos: (data ?? []).map(item => ({
      id: item.id,
      categoriaId: item.categoria_id,
      titulo: item.titulo,
      status: item.status,
      bairro: item.bairro,
      endereco: item.endereco,
      criadoEm: item.created_at,
      ocorrenciaPrincipalId: item.ocorrencia_principal_id,
    })),
    total: count,
  };
}

export async function marcarOcorrenciaDuplicada(
  ocorrenciaId: string,
  statusEsperado: StatusOcorrencia,
  principalId: string,
  justificativa: string,
): Promise<ResultadoAlteracaoStatus> {
  const { data, error } = await supabase.rpc("marcar_ocorrencia_duplicada", {
    p_ocorrencia_id: ocorrenciaId,
    p_status_esperado: statusEsperado,
    p_ocorrencia_principal_id: principalId,
    p_justificativa: justificativa,
  });
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== ocorrenciaId ||
      data[0]?.status !== "duplicado" || data[0]?.ocorrencia_principal_id !== principalId) {
    throw new Error("Resposta inesperada ao marcar duplicidade.");
  }
  return data[0] as ResultadoAlteracaoStatus;
}

export async function buscarTituloPrincipal(id: string): Promise<string | null> {
  const { data, error } = await supabase.from("ocorrencias")
    .select("titulo")
    .eq("id", id)
    .maybeSingle<{ titulo: string }>();
  if (error) throw error;
  return data?.titulo ?? null;
}

export async function alterarStatusOcorrencia(
  ocorrenciaId: string,
  statusEsperado: StatusOcorrencia,
  novoStatus: StatusOcorrencia,
  justificativa: string | null,
): Promise<ResultadoAlteracaoStatus> {
  const { data, error } = await supabase.rpc("alterar_status_ocorrencia", {
    p_ocorrencia_id: ocorrenciaId,
    p_status_esperado: statusEsperado,
    p_novo_status: novoStatus,
    p_justificativa: justificativa,
  });
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== ocorrenciaId ||
      data[0]?.status !== novoStatus) {
    throw new Error("Resposta inesperada ao alterar o status.");
  }
  return data[0] as ResultadoAlteracaoStatus;
}

export function mensagemErroModeracao(error: unknown): string {
  const codigo = typeof error === "object" && error !== null && "code" in error
    ? String(error.code) : "";
  switch (codigo) {
    case "P3601": return "Sua sessão expirou. Entre novamente para continuar.";
    case "P3602": return "Você não tem permissão para alterar esta ocorrência.";
    case "P3603": return "Esta ocorrência não foi encontrada ou está indisponível.";
    case "P3604": return "Esta ocorrência foi atualizada por outra pessoa. Recarregamos os dados.";
    case "P3605": return "Esta mudança de status não é permitida.";
    case "P3606": return "Informe uma justificativa pública para esta alteração.";
    case "P3607": return "A justificativa pública deve ter no máximo 500 caracteres.";
    case "P3608": return "Use a ação específica para marcar esta ocorrência como duplicada.";
    case "P3609": return "O status desta ocorrência não permite marcá-la como duplicada.";
    case "P3610": return "A ocorrência principal não foi encontrada.";
    case "P3611": return "Uma ocorrência não pode ser principal dela mesma.";
    case "P3612": return "O status da principal não permite este vínculo. Atualize a busca.";
    case "P3613": return "A principal já é duplicada ou possui vínculo com outra ocorrência.";
    case "P3614": return "Esta ocorrência possui duplicadas vinculadas e não pode assumir esse status.";
    case "P3615": return "Não foi possível validar o vínculo de duplicidade. Atualize os dados.";
    case "P3616": return "Outra operação administrativa está sendo concluída. Atualize e tente novamente.";
    case "P3617": return "Há uma inconsistência nos vínculos existentes. Solicite uma revisão dos dados.";
    case "P3618": return "Não foi possível concluir a operação nesta sessão. Atualize e tente novamente.";
    default: return "Não foi possível alterar o status agora. Tente novamente.";
  }
}
