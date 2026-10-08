import type { Ocorrencia, StatusOcorrencia } from "@/data/ocorrencias";
import { supabase } from "@/lib/supabase";
import { carregarCapasOcorrencias, carregarFotosOcorrencia, type FotoOcorrenciaLeitura } from "@/lib/fotosOcorrencias";

export type OcorrenciaHome = Ocorrencia & { fotoPrincipalUrl: string | null };
export type DetalheOcorrencia = { ocorrencia: Ocorrencia; fotos: FotoOcorrenciaLeitura[] };

export function ehUuidOcorrencia(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const COLUNAS_PUBLICAS = "id, categoria_id, titulo, descricao, status, endereco, bairro, latitude, longitude, ocorrencia_principal_id, created_at, updated_at, resolvida_at, arquivada_at";

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

function mapearOcorrencia(data: OcorrenciaInserida): Omit<Ocorrencia, "quantidadeConfirmacoes"> {
  return {
    id: data.id,
    categoriaId: data.categoria_id,
    titulo: data.titulo,
    descricao: data.descricao,
    status: data.status,
    endereco: data.endereco,
    bairro: data.bairro,
    latitude: data.latitude,
    longitude: data.longitude,
    fotos: [],
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
    resolvidoEm: data.resolvida_at,
    arquivadoEm: data.arquivada_at,
    ocorrenciaPrincipalId: data.ocorrencia_principal_id,
  };
}

export async function contarConfirmacoesAtivas(ids: string[]): Promise<Map<string, number>> {
  const contagens = new Map<string, number>();
  const tamanhoPagina = 500;
  // Lê somente colunas concedidas a anon/authenticated; nunca usuario_id.
  for (let inicio = 0; ; inicio += tamanhoPagina) {
    const { data, error } = await supabase
      .from("confirmacoes")
      .select("id, ocorrencia_id")
      .in("ocorrencia_id", ids)
      .is("desfeito_at", null)
      .order("id", { ascending: true })
      .range(inicio, inicio + tamanhoPagina - 1);
    if (error) throw error;
    for (const confirmacao of data ?? []) {
      contagens.set(confirmacao.ocorrencia_id, (contagens.get(confirmacao.ocorrencia_id) ?? 0) + 1);
    }
    if (!data || data.length < tamanhoPagina) break;
  }
  return contagens;
}

export async function buscarOcorrenciaPorId(id: string): Promise<DetalheOcorrencia | null> {
  if (!ehUuidOcorrencia(id)) return null;
  const { data, error } = await supabase.from("ocorrencias")
    .select(COLUNAS_PUBLICAS)
    .eq("id", id)
    .maybeSingle<OcorrenciaInserida>();
  if (error) throw error;
  if (!data) return null;

  // A RLS determina se este registro é visível para a sessão atual.
  const [contagens, fotos] = await Promise.all([
    contarConfirmacoesAtivas([data.id]),
    carregarFotosOcorrencia(data.id),
  ]);
  return {
    ocorrencia: {
      ...mapearOcorrencia(data),
      quantidadeConfirmacoes: contagens.get(data.id) ?? 0,
      fotos: fotos.map(item => item.foto),
    },
    fotos,
  };
}

export async function listarOcorrenciasPublicas(): Promise<OcorrenciaHome[]> {
  const resultado: OcorrenciaHome[] = [];
  const tamanhoLote = 100;

  for (let inicio = 0; ; inicio += tamanhoLote) {
    const { data, error } = await supabase
      .from("ocorrencias")
      .select(COLUNAS_PUBLICAS)
      // Mantém a Home pública mesmo quando a sessão pode ler registros privados.
      .not("status", "in", "(rejeitado,arquivado)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(inicio, inicio + tamanhoLote - 1)
      .returns<OcorrenciaInserida[]>();
    if (error) throw error;
    if (!data?.length) break;

    const ids = data.map(ocorrencia => ocorrencia.id);
    const [contagens, capas] = await Promise.all([
      contarConfirmacoesAtivas(ids),
      carregarCapasOcorrencias(ids),
    ]);
    resultado.push(...data.map(ocorrencia => {
      const capa = capas.get(ocorrencia.id);
      return {
        ...mapearOcorrencia(ocorrencia),
        // Zero apenas após consulta bem-sucedida sem confirmações ativas.
        quantidadeConfirmacoes: contagens.get(ocorrencia.id) ?? 0,
        fotos: capa ? [capa.foto] : [],
        fotoPrincipalUrl: capa?.url ?? null,
      };
    }));
    if (data.length < tamanhoLote) break;
  }

  return resultado;
}

export async function listarMinhasOcorrencias(): Promise<OcorrenciaHome[]> {
  // A RPC usa auth.uid() e não retorna autor_id ao cliente.
  const { data, error } = await supabase.rpc("minhas_ocorrencias");
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Resposta inesperada ao carregar suas ocorrências.");
  const ocorrencias = data as OcorrenciaInserida[];
  if (ocorrencias.length === 0) return [];

  const ids = ocorrencias.map(ocorrencia => ocorrencia.id);
  const [contagens, capas] = await Promise.all([
    contarConfirmacoesAtivas(ids),
    carregarCapasOcorrencias(ids),
  ]);

  return ocorrencias.map(ocorrencia => {
    const capa = capas.get(ocorrencia.id);
    return {
      ...mapearOcorrencia(ocorrencia),
      quantidadeConfirmacoes: contagens.get(ocorrencia.id) ?? 0,
      fotos: capa ? [capa.foto] : [],
      fotoPrincipalUrl: capa?.url ?? null,
    };
  });
}

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
    .select(COLUNAS_PUBLICAS)
    .single<OcorrenciaInserida>();

  if (error || !data?.id) {
    throw error ?? new Error("O Supabase não retornou a ocorrência criada.");
  }

  return {
    ...mapearOcorrencia(data),
    autorId,
    latitude: data.latitude ?? dados.latitude,
    longitude: data.longitude ?? dados.longitude,
    quantidadeConfirmacoes: 0,
  };
}
