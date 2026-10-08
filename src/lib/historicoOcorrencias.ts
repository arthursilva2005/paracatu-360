import type { StatusOcorrencia } from "@/data/ocorrencias";
import { ehUuidOcorrencia } from "@/lib/ocorrencias";
import { supabase } from "@/lib/supabase";

export type HistoricoPublicoOcorrencia = {
  id: string;
  ocorrenciaId: string;
  statusAnterior: StatusOcorrencia | null;
  statusNovo: StatusOcorrencia;
  criadoEm: string;
};

type LinhaHistorico = {
  id: string;
  ocorrencia_id: string;
  status_anterior: StatusOcorrencia | null;
  status_novo: StatusOcorrencia;
  created_at: string;
};

export async function buscarHistoricoOcorrencia(ocorrenciaId: string): Promise<HistoricoPublicoOcorrencia[]> {
  if (!ehUuidOcorrencia(ocorrenciaId)) throw new Error("Identificador de ocorrência inválido.");

  const { data, error } = await supabase
    .from("historico_ocorrencias")
    .select("id, ocorrencia_id, status_anterior, status_novo, created_at")
    .eq("ocorrencia_id", ocorrenciaId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .returns<LinhaHistorico[]>();

  if (error) throw error;
  return (data ?? []).map(linha => ({
    id: linha.id,
    ocorrenciaId: linha.ocorrencia_id,
    statusAnterior: linha.status_anterior,
    statusNovo: linha.status_novo,
    criadoEm: linha.created_at,
  }));
}
