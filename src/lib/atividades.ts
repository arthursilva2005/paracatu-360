import type { StatusOcorrencia } from "@/data/ocorrencias";
import { listarHistoricoVisivel, type HistoricoPublicoOcorrencia } from "@/lib/historicoOcorrencias";
import { contarConfirmacoesAtivas } from "@/lib/ocorrencias";
import { supabase } from "@/lib/supabase";

type LinhaOcorrenciaAtividade = {
  id: string;
  categoria_id: string;
  titulo: string;
  endereco: string;
  bairro: string;
  status: StatusOcorrencia;
  created_at: string;
};

export type AtividadeOficial = {
  evento: HistoricoPublicoOcorrencia;
  ocorrencia: {
    id: string;
    categoriaId: string;
    titulo: string;
    endereco: string;
    bairro: string;
    status: StatusOcorrencia;
    criadoEm: string;
    quantidadeConfirmacoes: number;
  };
};

export async function listarAtividadesOficiais(): Promise<AtividadeOficial[]> {
  const eventos = await listarHistoricoVisivel();
  if (eventos.length === 0) return [];

  const ids = [...new Set(eventos.map(evento => evento.ocorrenciaId))];
  const ocorrencias = new Map<string, AtividadeOficial["ocorrencia"]>();
  const tamanhoLote = 100;

  for (let inicio = 0; inicio < ids.length; inicio += tamanhoLote) {
    const lote = ids.slice(inicio, inicio + tamanhoLote);
    const [resultadoOcorrencias, contagens] = await Promise.all([
      supabase
        .from("ocorrencias")
        .select("id, categoria_id, titulo, endereco, bairro, status, created_at")
        .in("id", lote)
        .returns<LinhaOcorrenciaAtividade[]>(),
      contarConfirmacoesAtivas(lote),
    ]);

    if (resultadoOcorrencias.error) throw resultadoOcorrencias.error;
    for (const linha of resultadoOcorrencias.data ?? []) {
      ocorrencias.set(linha.id, {
        id: linha.id,
        categoriaId: linha.categoria_id,
        titulo: linha.titulo,
        endereco: linha.endereco,
        bairro: linha.bairro,
        status: linha.status,
        criadoEm: linha.created_at,
        quantidadeConfirmacoes: contagens.get(linha.id) ?? 0,
      });
    }
  }

  // Se uma ocorrência deixar de estar visível durante o carregamento, não inventa dados.
  return eventos.flatMap(evento => {
    const ocorrencia = ocorrencias.get(evento.ocorrenciaId);
    return ocorrencia ? [{ evento, ocorrencia }] : [];
  });
}
