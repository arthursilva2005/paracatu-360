export interface FotoOcorrencia {
  id: string;
  storagePath: string;
  ordem: number;
}

export type StatusOcorrencia =
  | "registrado" | "em_analise" | "encaminhado" | "em_andamento"
  | "resolvido" | "rejeitado" | "duplicado" | "arquivado";

export interface Ocorrencia {
  id: string;
  autorId?: string; // Ausente na leitura pública: a autoria permanece privada no banco.
  categoriaId: string; // UUID da categoria.
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  fotos: FotoOcorrencia[];
  criadoEm: string;
  atualizadoEm: string;
  resolvidoEm: string | null;
  arquivadoEm: string | null;
  ocorrenciaPrincipalId: string | null;
  quantidadeConfirmacoes: number;
}

export type TipoSinalizacaoOcorrencia =
  | "atendimento_iniciado" | "problema_resolvido" | "continua_igual" | "piorou";

// Labels e cores atuais preservados; os novos estados ainda não aparecem no Dashboard.
export const METADADOS_STATUS: Record<StatusOcorrencia, { label: string; bg: string; classeBg: string }> = {
  registrado: { label: "Registrado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  em_analise: { label: "Em análise", bg: "#d97706", classeBg: "bg-[#d97706]" },
  encaminhado: { label: "Encaminhado", bg: "#075ce5", classeBg: "bg-[#075ce5]" },
  em_andamento: { label: "Em andamento", bg: "#7c3aed", classeBg: "bg-[#7c3aed]" },
  resolvido: { label: "Resolvido", bg: "#16a34a", classeBg: "bg-[#16a34a]" },
  rejeitado: { label: "Rejeitado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  duplicado: { label: "Duplicado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  arquivado: { label: "Arquivado", bg: "#586a80", classeBg: "bg-[#586a80]" },
};

export function localOcorrencia(ocorrencia: Ocorrencia): string {
  return `${ocorrencia.bairro} · ${ocorrencia.endereco}`;
}

export function calcularRelevancia(confirmacoes: number): "alta" | "media" | "baixa" {
  if (confirmacoes >= 30) return "alta";
  if (confirmacoes >= 15) return "media";
  return "baixa";
}

export const labelRelevancia = {
  alta: "Alta relevância",
  media: "Média relevância",
  baixa: "Baixa relevância",
} as const;

export const corRelevancia = {
  alta: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  media: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  baixa: { bg: "bg-[#f0f9ff]", text: "text-[#0284c7]", dot: "bg-[#0284c7]" },
} as const;
