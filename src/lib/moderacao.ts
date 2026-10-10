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
    case "P3608": return "A marcação de duplicidade ainda não está disponível.";
    default: return "Não foi possível alterar o status agora. Tente novamente.";
  }
}
