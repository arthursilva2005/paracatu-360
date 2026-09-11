export type StatusOcorrencia = "Encaminhado" | "Em análise" | "Em atendimento" | "Resolvido";
export type CategoriaOcorrencia = "Vias" | "Iluminação" | "Limpeza" | "Segurança" | "Outros";

export type Ocorrencia = {
  id: string;
  categoria: CategoriaOcorrencia;
  status: StatusOcorrencia;
  titulo: string;
  local: string;
  descricao: string;
  confirmacoes: number;
  tempo: string;
  confirmadoPorMim: boolean;
};

export const ocorrenciasIniciais: Ocorrencia[] = [
  {
    id: "1",
    categoria: "Vias",
    status: "Encaminhado",
    titulo: "Buraco na via próximo à escola",
    local: "Centro · Rua da Praça",
    descricao: "O buraco está localizado na pista sentido escola, próximo ao cruzamento com a Rua das Flores. O trecho está com trânsito lento e risco de danos a veículos.",
    confirmacoes: 24,
    tempo: "Há 2 dias",
    confirmadoPorMim: false,
  },
  {
    id: "2",
    categoria: "Iluminação",
    status: "Em análise",
    titulo: "Ponto de iluminação apagado",
    local: "Bairro do Piloto · Rua das Flores",
    descricao: "Poste sem luz há mais de uma semana. O trecho fica escuro à noite, gerando insegurança para pedestres.",
    confirmacoes: 12,
    tempo: "Há 5 horas",
    confirmadoPorMim: false,
  },
  {
    id: "3",
    categoria: "Limpeza",
    status: "Resolvido",
    titulo: "Entulho retirado da calçada",
    local: "Centro · Calçada da Igreja",
    descricao: "Entulho de obra estava bloqueando a passagem de pedestres e cadeirantes na calçada.",
    confirmacoes: 8,
    tempo: "Ontem",
    confirmadoPorMim: false,
  },
  {
    id: "4",
    categoria: "Segurança",
    status: "Em análise",
    titulo: "Semáforo com defeito no cruzamento",
    local: "Av. Olegário Maciel · Centro",
    descricao: "Semáforo piscando em amarelo continuamente, sem alternar as fases. Causa confusão e risco de acidentes.",
    confirmacoes: 31,
    tempo: "Há 1 dia",
    confirmadoPorMim: false,
  },
  {
    id: "5",
    categoria: "Vias",
    status: "Em atendimento",
    titulo: "Alagamento na Rua das Acácias",
    local: "Bairro São João · Rua das Acácias",
    descricao: "Boca de lobo entupida causa alagamento a cada chuva, prejudicando moradores e comércios locais.",
    confirmacoes: 47,
    tempo: "Há 3 horas",
    confirmadoPorMim: false,
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
