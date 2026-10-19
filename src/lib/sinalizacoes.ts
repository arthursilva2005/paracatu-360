import type { TipoSinalizacaoOcorrencia } from "@/data/ocorrencias";
import { ehUuidOcorrencia } from "@/lib/ocorrencias";
import { supabase } from "@/lib/supabase";

export type TipoSinalizacao = TipoSinalizacaoOcorrencia;

export type MinhaSinalizacao = {
  id: string;
  tipo: TipoSinalizacao;
  createdAt: string;
};

export type ContagensSinalizacoes = Record<TipoSinalizacao, number>;

const tipos: readonly TipoSinalizacao[] = [
  "atendimento_iniciado", "problema_resolvido", "continua_igual", "piorou",
];

function tipoValido(valor: unknown): valor is TipoSinalizacao {
  return tipos.includes(valor as TipoSinalizacao);
}

function exigirUuid(valor: string): void {
  if (!ehUuidOcorrencia(valor)) throw new Error("Identificador inválido.");
}

function lerSinalizacao(valor: unknown): MinhaSinalizacao {
  if (!valor || typeof valor !== "object") throw new Error("Resposta inesperada da sinalização.");
  const linha = valor as Record<string, unknown>;
  if (typeof linha.id !== "string" || !ehUuidOcorrencia(linha.id) ||
    !tipoValido(linha.tipo) || typeof linha.created_at !== "string") {
    throw new Error("Resposta inesperada da sinalização.");
  }
  return { id: linha.id, tipo: linha.tipo, createdAt: linha.created_at };
}

function lerLinhaUnica(valor: unknown, ausenciaPermitida: boolean): MinhaSinalizacao | null {
  if (valor === null && ausenciaPermitida) return null;
  if (!Array.isArray(valor) || valor.length > 1 || (!ausenciaPermitida && valor.length !== 1)) {
    throw new Error("Resposta inesperada da sinalização.");
  }
  return valor.length === 0 ? null : lerSinalizacao(valor[0]);
}

export async function buscarMinhaSinalizacaoAtiva(ocorrenciaId: string): Promise<MinhaSinalizacao | null> {
  exigirUuid(ocorrenciaId);
  const { data, error } = await supabase.rpc("minha_sinalizacao_ativa", {
    p_ocorrencia_id: ocorrenciaId,
  });
  if (error) throw error;
  return lerLinhaUnica(data, true);
}

export async function definirSinalizacao(
  ocorrenciaId: string, tipo: TipoSinalizacao, esperadaId: string | null,
): Promise<MinhaSinalizacao> {
  exigirUuid(ocorrenciaId);
  if (esperadaId !== null) exigirUuid(esperadaId);
  const { data, error } = await supabase.rpc("definir_sinalizacao_ocorrencia", {
    p_ocorrencia_id: ocorrenciaId,
    p_tipo: tipo,
    p_sinalizacao_esperada_id: esperadaId,
  });
  if (error) throw error;
  const sinalizacao = lerLinhaUnica(data, false);
  if (!sinalizacao) throw new Error("Resposta inesperada da sinalização.");
  return sinalizacao;
}

export async function desfazerSinalizacao(
  ocorrenciaId: string, esperadaId: string,
): Promise<boolean> {
  exigirUuid(ocorrenciaId);
  exigirUuid(esperadaId);
  const { data, error } = await supabase.rpc("desfazer_sinalizacao_ocorrencia", {
    p_ocorrencia_id: ocorrenciaId,
    p_sinalizacao_esperada_id: esperadaId,
  });
  if (error) throw error;
  if (typeof data !== "boolean") throw new Error("Resposta inesperada ao remover a sinalização.");
  return data;
}

function lerContagem(valor: unknown): number {
  const numero = typeof valor === "number" || typeof valor === "string" ? Number(valor) : NaN;
  if (!Number.isSafeInteger(numero) || numero < 0) throw new Error("Resposta inesperada das contagens.");
  return numero;
}

export async function contarSinalizacoes(ocorrenciaId: string): Promise<ContagensSinalizacoes | null> {
  exigirUuid(ocorrenciaId);
  const { data, error } = await supabase.rpc("contar_sinalizacoes_ocorrencia", {
    p_ocorrencia_id: ocorrenciaId,
  });
  if (error) throw error;
  if (!Array.isArray(data) || data.length > 1) throw new Error("Resposta inesperada das contagens.");
  if (data.length === 0) return null;
  const linha = data[0] as Record<string, unknown>;
  if (!linha || typeof linha !== "object") throw new Error("Resposta inesperada das contagens.");
  return {
    atendimento_iniciado: lerContagem(linha.atendimento_iniciado),
    problema_resolvido: lerContagem(linha.problema_resolvido),
    continua_igual: lerContagem(linha.continua_igual),
    piorou: lerContagem(linha.piorou),
  };
}

export function sessaoSinalizacaoExpirada(error: unknown): boolean {
  const erro = error as { code?: string; status?: number; name?: string } | null;
  return erro?.code === "P3620" || erro?.status === 401 || erro?.name === "AuthSessionMissingError" ||
    erro?.code === "PGRST301" || erro?.code === "PGRST303" ||
    erro?.code === "session_not_found" || erro?.code === "refresh_token_not_found";
}

export function mensagemErroSinalizacao(error: unknown): string {
  const erro = error as { code?: string } | null;
  if (sessaoSinalizacaoExpirada(error)) return "Sua sessão expirou. Entre novamente para continuar.";
  if (erro?.code === "P3621") return "Esta ocorrência não está disponível.";
  if (erro?.code === "P3622") return "Esta opção não está disponível.";
  if (erro?.code === "P3623") return "Esta ocorrência não aceita novas sinalizações.";
  if (erro?.code === "P3624") return "Essa sinalização foi alterada em outra sessão. Recarregamos o estado atual.";
  if (erro?.code === "P3626") return "Não foi possível concluir seu relato agora. Tente novamente.";
  return "Não foi possível atualizar sua sinalização agora.";
}
