export interface CategoriaOcorrencia {
  id: string;
  nome: string;
  slug: string;
  ativa: boolean;
  ordem: number;
}

export interface FotoOcorrencia {
  id: string;
  url: string;
  ordem: number;
}

export type StatusOcorrencia =
  | "registrado" | "em_analise" | "encaminhado" | "em_andamento"
  | "resolvido" | "rejeitado" | "duplicado" | "arquivado";

export interface Ocorrencia {
  id: string;
  autorId: string;
  categoriaId: string;
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
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

export interface SinalizacaoOcorrencia {
  id: string;
  ocorrenciaId: string;
  usuarioId: string;
  tipo: TipoSinalizacaoOcorrencia;
  fotoUrl: string | null;
  ativa: boolean;
  criadoEm: string;
}

export interface HistoricoOcorrencia {
  id: string;
  ocorrenciaId: string;
  statusAnterior: StatusOcorrencia | null;
  statusNovo: StatusOcorrencia;
  alteradoPorId: string | null;
  observacao: string | null;
  criadoEm: string;
}

export type PapelUsuario = "cidadao" | "moderador" | "administrador";

export const CATEGORIAS_OFICIAIS: CategoriaOcorrencia[] = [
  { id: "transito-vias", nome: "Trânsito e Vias", slug: "transito-vias", ativa: true, ordem: 1 },
  { id: "infraestrutura", nome: "Infraestrutura", slug: "infraestrutura", ativa: true, ordem: 2 },
  { id: "limpeza-urbana", nome: "Limpeza Urbana", slug: "limpeza-urbana", ativa: true, ordem: 3 },
  { id: "meio-ambiente", nome: "Meio Ambiente", slug: "meio-ambiente", ativa: true, ordem: 4 },
  { id: "agua-saneamento", nome: "Água e Saneamento", slug: "agua-saneamento", ativa: true, ordem: 5 },
  { id: "outros", nome: "Outros", slug: "outros", ativa: true, ordem: 6 },
];

// Compatibilidade autorizada: a UI mantém as categorias antigas até a migração visual.
// IDs próprios evitam reclassificar silenciosamente os mocks (especialmente Segurança).
export const CATEGORIAS_OCORRENCIA: CategoriaOcorrencia[] = [
  { id: "legado-vias", nome: "Vias", slug: "vias", ativa: true, ordem: 1 },
  { id: "legado-iluminacao", nome: "Iluminação", slug: "iluminacao", ativa: true, ordem: 2 },
  { id: "legado-limpeza", nome: "Limpeza", slug: "limpeza", ativa: true, ordem: 3 },
  { id: "legado-seguranca", nome: "Segurança", slug: "seguranca", ativa: true, ordem: 4 },
  CATEGORIAS_OFICIAIS[5],
];

export const FILTROS_CATEGORIA = [{ id: "", nome: "Todas" }, ...CATEGORIAS_OCORRENCIA];

export function nomeCategoria(id: string): string {
  return CATEGORIAS_OCORRENCIA.find(c => c.id === id)?.nome
    ?? CATEGORIAS_OFICIAIS.find(c => c.id === id)?.nome ?? "Outros";
}

// Labels e cores atuais preservados; os novos estados ainda não aparecem no Dashboard.
export const METADADOS_STATUS: Record<StatusOcorrencia, { label: string; bg: string; classeBg: string }> = {
  registrado: { label: "Registrado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  em_analise: { label: "Em análise", bg: "#d97706", classeBg: "bg-[#d97706]" },
  encaminhado: { label: "Encaminhado", bg: "#075ce5", classeBg: "bg-[#075ce5]" },
  em_andamento: { label: "Em atendimento", bg: "#7c3aed", classeBg: "bg-[#7c3aed]" },
  resolvido: { label: "Resolvido", bg: "#16a34a", classeBg: "bg-[#16a34a]" },
  rejeitado: { label: "Rejeitado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  duplicado: { label: "Duplicado", bg: "#586a80", classeBg: "bg-[#586a80]" },
  arquivado: { label: "Arquivado", bg: "#586a80", classeBg: "bg-[#586a80]" },
};

export const STATUS_DASHBOARD: StatusOcorrencia[] = ["em_analise", "em_andamento", "encaminhado", "resolvido"];

// Apresentação temporária dos mocks; timestamps ISO são a fonte de verdade do modelo.
const TEMPOS_MOCK: Record<string, string> = {
  "1": "Há 2 dias", "2": "Há 5 horas", "3": "Ontem", "4": "Há 1 dia", "5": "Há 3 horas",
};

export function tempoOcorrencia(ocorrencia: Ocorrencia): string {
  return TEMPOS_MOCK[ocorrencia.id] ?? "Agora mesmo";
}

export function localOcorrencia(ocorrencia: Ocorrencia): string {
  // O mock 4 já exibia endereço antes do bairro.
  return ocorrencia.id === "4"
    ? `${ocorrencia.endereco} · ${ocorrencia.bairro}`
    : `${ocorrencia.bairro} · ${ocorrencia.endereco}`;
}

export const ocorrenciasIniciais: Ocorrencia[] = [
  {
    id: "1",
    categoriaId: "legado-vias",
    status: "encaminhado",
    titulo: "Buraco na via próximo à escola",
    endereco: "Rua da Praça",
    bairro: "Centro",
    descricao: "O buraco está localizado na pista sentido escola, próximo ao cruzamento com a Rua das Flores. O trecho está com trânsito lento e risco de danos a veículos.",
    quantidadeConfirmacoes: 24,
    autorId: "usuario-mock-1",
    latitude: -17.221,
    longitude: -46.871,
    fotos: [],
    criadoEm: "2026-09-10T10:00:00-03:00",
    atualizadoEm: "2026-09-10T10:00:00-03:00",
    resolvidoEm: null,
    arquivadoEm: null,
    ocorrenciaPrincipalId: null,
  },
  {
    id: "2",
    categoriaId: "legado-iluminacao",
    status: "em_analise",
    titulo: "Ponto de iluminação apagado",
    endereco: "Rua das Flores",
    bairro: "Bairro do Piloto",
    descricao: "Poste sem luz há mais de uma semana. O trecho fica escuro à noite, gerando insegurança para pedestres.",
    quantidadeConfirmacoes: 12,
    autorId: "usuario-mock-2",
    latitude: -17.222,
    longitude: -46.872,
    fotos: [],
    criadoEm: "2026-09-12T05:00:00-03:00",
    atualizadoEm: "2026-09-12T05:00:00-03:00",
    resolvidoEm: null,
    arquivadoEm: null,
    ocorrenciaPrincipalId: null,
  },
  {
    id: "3",
    categoriaId: "legado-limpeza",
    status: "resolvido",
    titulo: "Entulho retirado da calçada",
    endereco: "Calçada da Igreja",
    bairro: "Centro",
    descricao: "Entulho de obra estava bloqueando a passagem de pedestres e cadeirantes na calçada.",
    quantidadeConfirmacoes: 8,
    autorId: "usuario-mock-3",
    latitude: -17.223,
    longitude: -46.873,
    fotos: [],
    criadoEm: "2026-09-11T10:00:00-03:00",
    atualizadoEm: "2026-09-12T08:00:00-03:00",
    resolvidoEm: "2026-09-12T08:00:00-03:00",
    arquivadoEm: null,
    ocorrenciaPrincipalId: null,
  },
  {
    id: "4",
    categoriaId: "legado-seguranca",
    status: "em_analise",
    titulo: "Semáforo com defeito no cruzamento",
    endereco: "Av. Olegário Maciel",
    bairro: "Centro",
    descricao: "Semáforo piscando em amarelo continuamente, sem alternar as fases. Causa confusão e risco de acidentes.",
    quantidadeConfirmacoes: 31,
    autorId: "usuario-mock-4",
    latitude: -17.224,
    longitude: -46.874,
    fotos: [],
    criadoEm: "2026-09-11T10:00:00-03:00",
    atualizadoEm: "2026-09-11T10:00:00-03:00",
    resolvidoEm: null,
    arquivadoEm: null,
    ocorrenciaPrincipalId: null,
  },
  {
    id: "5",
    categoriaId: "legado-vias",
    status: "em_andamento",
    titulo: "Alagamento na Rua das Acácias",
    endereco: "Rua das Acácias",
    bairro: "Bairro São João",
    descricao: "Boca de lobo entupida causa alagamento a cada chuva, prejudicando moradores e comércios locais.",
    quantidadeConfirmacoes: 47,
    autorId: "usuario-mock-5",
    latitude: -17.225,
    longitude: -46.875,
    fotos: [],
    criadoEm: "2026-09-12T07:00:00-03:00",
    atualizadoEm: "2026-09-12T07:00:00-03:00",
    resolvidoEm: null,
    arquivadoEm: null,
    ocorrenciaPrincipalId: null,
  },
];

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
