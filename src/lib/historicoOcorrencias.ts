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

const COLUNAS_HISTORICO_PUBLICO = "id, ocorrencia_id, status_anterior, status_novo, created_at";

function mapearLinhaHistorico(linha: LinhaHistorico): HistoricoPublicoOcorrencia {
  return {
    id: linha.id,
    ocorrenciaId: linha.ocorrencia_id,
    statusAnterior: linha.status_anterior,
    statusNovo: linha.status_novo,
    criadoEm: linha.created_at,
  };
}

export async function listarHistoricoVisivel(): Promise<HistoricoPublicoOcorrencia[]> {
  const eventos: HistoricoPublicoOcorrencia[] = [];
  const tamanhoPagina = 500;

  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from("historico_ocorrencias")
      .select(COLUNAS_HISTORICO_PUBLICO)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(inicio, inicio + tamanhoPagina - 1)
      .returns<LinhaHistorico[]>();

    if (error) throw error;
    eventos.push(...(data ?? []).map(mapearLinhaHistorico));
    if (!data || data.length < tamanhoPagina) break;
  }

  return eventos;
}

export async function buscarHistoricoOcorrencia(ocorrenciaId: string): Promise<HistoricoPublicoOcorrencia[]> {
  if (!ehUuidOcorrencia(ocorrenciaId)) throw new Error("Identificador de ocorrência inválido.");

  const { data, error } = await supabase
    .from("historico_ocorrencias")
    .select(COLUNAS_HISTORICO_PUBLICO)
    .eq("ocorrencia_id", ocorrenciaId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .returns<LinhaHistorico[]>();

  if (error) throw error;
  return (data ?? []).map(mapearLinhaHistorico);
}

export type HistoricoAdministrativoOcorrencia = HistoricoPublicoOcorrencia & {
  observacao: string | null; // Justificativa pública, nunca nota interna.
};

export async function buscarHistoricoAdministrativo(ocorrenciaId: string): Promise<HistoricoAdministrativoOcorrencia[]> {
  if (!ehUuidOcorrencia(ocorrenciaId)) throw new Error("Identificador de ocorrência inválido.");

  const { data, error } = await supabase
    .from("historico_ocorrencias")
    .select("id, ocorrencia_id, status_anterior, status_novo, observacao, created_at")
    .eq("ocorrencia_id", ocorrenciaId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .returns<(LinhaHistorico & { observacao: string | null })[]>();

  if (error) throw error;
  return (data ?? []).map(linha => ({ ...mapearLinhaHistorico(linha), observacao: linha.observacao }));
}
