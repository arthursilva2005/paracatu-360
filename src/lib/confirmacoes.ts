import { supabase } from "@/lib/supabase";
import { contarConfirmacoesAtivas, ehUuidOcorrencia } from "@/lib/ocorrencias";

function exigirUuid(id: string): void {
  if (!ehUuidOcorrencia(id)) throw new Error("Identificador de ocorrência inválido.");
}

export async function buscarMinhaConfirmacao(ocorrenciaId: string): Promise<string | null> {
  exigirUuid(ocorrenciaId);
  const { data, error } = await supabase.rpc("minha_confirmacao_ativa", {
    p_ocorrencia_id: ocorrenciaId,
  });
  if (error) throw error;
  if (data !== null && (typeof data !== "string" || !ehUuidOcorrencia(data))) {
    throw new Error("Resposta inesperada da consulta de confirmação.");
  }
  return data;
}

export async function buscarEstadoConfirmacao(ocorrenciaId: string) {
  exigirUuid(ocorrenciaId);
  const [confirmacaoId, contagens] = await Promise.all([
    buscarMinhaConfirmacao(ocorrenciaId),
    contarConfirmacoesAtivas([ocorrenciaId]),
  ]);
  return { confirmacaoId, quantidade: contagens.get(ocorrenciaId) ?? 0 };
}

async function verificarSessao(usuarioId: string): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user || data.user.id !== usuarioId) {
    throw { code: "SESSAO_INVALIDA" };
  }
}

export async function confirmarOcorrencia(ocorrenciaId: string, usuarioId: string): Promise<void> {
  exigirUuid(ocorrenciaId);
  await verificarSessao(usuarioId);
  // Consulta booleana já prevista no banco, sem ler ou expor autoria.
  const { data: autor, error: erroAutor } = await supabase.rpc("usuario_eh_autor_ocorrencia", {
    p_ocorrencia_id: ocorrenciaId,
  });
  if (erroAutor) throw erroAutor;
  if (autor === true) throw { code: "CONFIRMACAO_PROPRIA" };
  if (autor !== false) throw new Error("Resposta inesperada da consulta de autoria.");

  const { error } = await supabase.from("confirmacoes").insert({
    ocorrencia_id: ocorrenciaId,
    usuario_id: usuarioId,
  });
  if (error) throw error;
}

export async function desfazerConfirmacao(
  ocorrenciaId: string, confirmacaoId: string, usuarioId: string,
): Promise<void> {
  exigirUuid(ocorrenciaId);
  exigirUuid(confirmacaoId);
  await verificarSessao(usuarioId);
  const { data, error } = await supabase.from("confirmacoes")
    .update({ desfeito_at: new Date().toISOString() })
    .eq("id", confirmacaoId)
    .eq("ocorrencia_id", ocorrenciaId)
    .is("desfeito_at", null)
    .select("id");
  if (error) throw error;
  // Zero linhas é possível se outra aba já desfez; o chamador sempre relê o estado.
  if (!Array.isArray(data) || data.length > 1 || (data.length === 1 && data[0].id !== confirmacaoId)) {
    throw new Error("Resposta inesperada ao desfazer confirmação.");
  }
}

export function sessaoConfirmacaoExpirada(error: unknown): boolean {
  const erro = error as { code?: string; status?: number; name?: string } | null;
  return erro?.name === "AuthSessionMissingError" || erro?.code === "SESSAO_INVALIDA" || erro?.code === "PGRST301" ||
    erro?.code === "PGRST303" || erro?.status === 401 || erro?.code === "session_not_found" ||
    erro?.code === "refresh_token_not_found" || erro?.code === "refresh_token_already_used";
}

export function mensagemErroConfirmacao(error: unknown, desfazendo = false): string {
  const erro = error as { code?: string } | null;
  if (erro?.code === "CONFIRMACAO_PROPRIA") return "Você não pode confirmar sua própria ocorrência.";
  if (sessaoConfirmacaoExpirada(error)) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }
  return desfazendo ? "Não foi possível remover sua confirmação agora."
    : "Não foi possível confirmar esta ocorrência agora.";
}
