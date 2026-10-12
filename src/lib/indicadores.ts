import { calcularRelevancia, type Ocorrencia, type StatusOcorrencia } from "@/data/ocorrencias";
import type { CategoriaOcorrencia } from "@/hooks/useCategorias";

export const STATUS_PUBLICOS: StatusOcorrencia[] = [
  "registrado", "em_analise", "encaminhado", "em_andamento", "resolvido", "duplicado",
];

const STATUS_EM_ABERTO: StatusOcorrencia[] = [
  "registrado", "em_analise", "encaminhado", "em_andamento",
];

export type IndicadoresDashboard = {
  total: number;
  emAberto: number;
  resolvidas: number;
  duplicadas: number;
  altaRelevancia: number;
  confirmacoesAtivas: number;
  porStatus: { status: StatusOcorrencia; count: number }[];
  porCategoria: { categoria: CategoriaOcorrencia; count: number }[];
  porRelevancia: { nivel: "baixa" | "media" | "alta"; count: number }[];
  porBairro: { bairro: string; count: number }[];
  recentes: Ocorrencia[];
  maisRelevantes: Ocorrencia[];
};

export function calcularIndicadoresDashboard(
  ocorrencias: Ocorrencia[],
  categorias: CategoriaOcorrencia[],
): IndicadoresDashboard {
  // Defesa adicional para manter o painel público mesmo em uma sessão de equipe.
  const publicas = ocorrencias.filter(ocorrencia => STATUS_PUBLICOS.includes(ocorrencia.status));
  const contagensStatus = new Map<StatusOcorrencia, number>();
  const contagensCategoria = new Map<string, number>();
  const contagensBairro = new Map<string, number>();
  const contagensRelevancia = { baixa: 0, media: 0, alta: 0 };
  let confirmacoesAtivas = 0;

  for (const ocorrencia of publicas) {
    contagensStatus.set(ocorrencia.status, (contagensStatus.get(ocorrencia.status) ?? 0) + 1);
    contagensCategoria.set(ocorrencia.categoriaId, (contagensCategoria.get(ocorrencia.categoriaId) ?? 0) + 1);
    const bairro = ocorrencia.bairro.trim().replace(/\s+/g, " ");
    contagensBairro.set(bairro, (contagensBairro.get(bairro) ?? 0) + 1);
    const nivel = calcularRelevancia(ocorrencia.quantidadeConfirmacoes);
    contagensRelevancia[nivel]++;
    confirmacoesAtivas += ocorrencia.quantidadeConfirmacoes;
  }

  const ordenarRecentes = (a: Ocorrencia, b: Ocorrencia) =>
    Date.parse(b.criadoEm) - Date.parse(a.criadoEm) || a.id.localeCompare(b.id);

  return {
    total: publicas.length,
    emAberto: publicas.filter(ocorrencia => STATUS_EM_ABERTO.includes(ocorrencia.status)).length,
    resolvidas: contagensStatus.get("resolvido") ?? 0,
    duplicadas: contagensStatus.get("duplicado") ?? 0,
    altaRelevancia: contagensRelevancia.alta,
    confirmacoesAtivas,
    porStatus: STATUS_PUBLICOS.map(status => ({ status, count: contagensStatus.get(status) ?? 0 })),
    porCategoria: categorias.map(categoria => ({
      categoria,
      count: contagensCategoria.get(categoria.id) ?? 0,
    })),
    porRelevancia: (["baixa", "media", "alta"] as const).map(nivel => ({
      nivel,
      count: contagensRelevancia[nivel],
    })),
    porBairro: [...contagensBairro].map(([bairro, count]) => ({ bairro, count }))
      .sort((a, b) => b.count - a.count || a.bairro.localeCompare(b.bairro, "pt-BR"))
      .slice(0, 5),
    recentes: [...publicas].sort(ordenarRecentes).slice(0, 5),
    maisRelevantes: [...publicas].sort((a, b) =>
      b.quantidadeConfirmacoes - a.quantidadeConfirmacoes || ordenarRecentes(a, b)
    ).slice(0, 5),
  };
}
