import type { Ocorrencia, StatusOcorrencia } from "@/data/ocorrencias";
import { supabase } from "@/lib/supabase";

export type DadosCriacaoOcorrencia = Pick<
  Ocorrencia,
  "categoriaId" | "titulo" | "descricao" | "endereco" | "bairro" | "latitude" | "longitude"
>;

type OcorrenciaInserida = {
  id: string;
  categoria_id: string;
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  ocorrencia_principal_id: string | null;
  created_at: string;
  updated_at: string;
  resolvida_at: string | null;
  arquivada_at: string | null;
};

export async function criarOcorrencia(
  dados: DadosCriacaoOcorrencia,
  autorId: string,
): Promise<Ocorrencia> {
  const { data, error } = await supabase
    .from("ocorrencias")
    .insert({
      autor_id: autorId,
      categoria_id: dados.categoriaId,
      titulo: dados.titulo,
      descricao: dados.descricao,
      endereco: dados.endereco,
      bairro: dados.bairro,
      latitude: dados.latitude,
      longitude: dados.longitude,
    })
    .select(
      "id, categoria_id, titulo, descricao, status, endereco, bairro, latitude, longitude, ocorrencia_principal_id, created_at, updated_at, resolvida_at, arquivada_at",
    )
    .single<OcorrenciaInserida>();

  if (error || !data?.id) {
    throw error ?? new Error("O Supabase não retornou a ocorrência criada.");
  }

  return {
    id: data.id,
    autorId,
    categoriaId: data.categoria_id,
    titulo: data.titulo,
    descricao: data.descricao,
    status: data.status,
    endereco: data.endereco,
    bairro: data.bairro,
    latitude: data.latitude ?? dados.latitude,
    longitude: data.longitude ?? dados.longitude,
    fotos: [],
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
    resolvidoEm: data.resolvida_at,
    arquivadoEm: data.arquivada_at,
    ocorrenciaPrincipalId: data.ocorrencia_principal_id,
    quantidadeConfirmacoes: 0,
  };
}
