import { Ocorrencia, calcularRelevancia, corRelevancia, labelRelevancia } from "@/data/ocorrencias";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onBack: () => void;
  ocorrencia: Ocorrencia;
  onConfirmar: (id: string) => void;
};

const statusColor: Record<string, string> = {
  "Encaminhado": "bg-[#075ce5]",
  "Em análise":  "bg-[#d97706]",
  "Em atendimento": "bg-[#7c3aed]",
  "Resolvido":   "bg-[#16a34a]",
};

export default function Detalhe({ activeTab, onNavigate, onBack, ocorrencia, onConfirmar }: Props) {
  const relevancia = calcularRelevancia(ocorrencia.confirmacoes);
  const cor = corRelevancia[relevancia];
  const progresso = Math.min(100, Math.round((ocorrencia.confirmacoes / 50) * 100));

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />

      {/* Barra de volta */}
      <div className="bg-white w-full px-[16px] py-[10px] flex items-center gap-[8px] border-b border-[#e8eef5]">
        <button
          onClick={onBack}
          className="flex items-center gap-[6px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[7px] border-none outline-none cursor-pointer active:opacity-70 transition-opacity"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[13px]">Voltar</p>
        </button>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] ml-[4px]">Detalhes da ocorrência</p>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

          {/* Título */}
          <div className="flex flex-col gap-[8px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[10px] tracking-widest">
              OCORRÊNCIA · {ocorrencia.categoria.toUpperCase()}
            </p>
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px] leading-snug w-full">
              {ocorrencia.titulo}
            </p>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
              {ocorrencia.local}
            </p>
          </div>

          {/* Card resumo */}
          <div className="bg-white rounded-[16px] w-full border border-[#e8eef5]">
            <div className="flex flex-col gap-[14px] p-[16px]">

              {/* Status + relevância */}
              <div className="flex items-center justify-between w-full gap-[8px]">
                <span className={`${statusColor[ocorrencia.status] ?? "bg-[#586a80]"} px-[10px] py-[5px] rounded-[999px]`}>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[12px]">{ocorrencia.status}</p>
                </span>
                <div className={`flex items-center gap-[5px] px-[10px] py-[5px] rounded-[999px] ${cor.bg}`}>
                  <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${cor.dot}`} />
                  <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[11px] ${cor.text}`}>
                    {labelRelevancia[relevancia]}
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="flex flex-col gap-[6px] w-full">
                <div className="flex items-center justify-between">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">
                    {ocorrencia.confirmacoes} confirmações
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
                    {progresso}% da meta
                  </p>
                </div>
                <div className="w-full bg-[#f3f6fa] rounded-full h-[7px] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      relevancia === "alta" ? "bg-[#dc2626]" :
                      relevancia === "media" ? "bg-[#d97706]" : "bg-[#075ce5]"
                    }`}
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px]">
                  Meta: 50 confirmações para prioridade máxima
                </p>
              </div>

              {/* Descrição */}
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[13px] leading-relaxed w-full">
                {ocorrencia.descricao}
              </p>

              {/* Informações */}
              <div className="flex flex-col gap-[10px] w-full pt-[4px] border-t border-[#f3f6fa]">
                {[
                  { label: "Categoria", value: ocorrencia.categoria },
                  { label: "Local", value: ocorrencia.local },
                  { label: "Registrado", value: ocorrencia.tempo },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">{label}</p>
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Atualizações */}
          <div className="flex flex-col gap-[12px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Atualizações</p>
            {[
              { titulo: "Encaminhado para manutenção", tempo: "Há 2 dias", texto: "A ocorrência foi enviada para a equipe de infraestrutura urbana e está em análise para agendamento do reparo." },
              { titulo: `${ocorrencia.confirmacoes} confirmações recebidas`, tempo: "Há 3 dias", texto: "Moradores confirmaram a ocorrência. A equipe iniciou o levantamento do local para priorização." },
            ].map((a, i) => (
              <div key={i} className="bg-white rounded-[16px] border border-[#e8eef5] p-[16px] flex flex-col gap-[8px]">
                <div className="flex items-start justify-between gap-[8px]">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px] flex-1">{a.titulo}</p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px] shrink-0 mt-[1px]">{a.tempo}</p>
                </div>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] leading-relaxed">{a.texto}</p>
              </div>
            ))}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-[12px] w-full pb-[8px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[18px]">Ações</p>
            <div className="flex gap-[12px] w-full">
              <button
                onClick={() => !ocorrencia.confirmadoPorMim && onConfirmar(ocorrencia.id)}
                disabled={ocorrencia.confirmadoPorMim}
                className={`flex-1 rounded-[16px] py-[14px] px-[8px] border-none outline-none cursor-pointer transition-all duration-150 active:scale-[0.98] flex flex-col items-center gap-[4px] ${
                  ocorrencia.confirmadoPorMim
                    ? "bg-[#e8f0fe] cursor-default"
                    : "bg-[#075ce5] hover:bg-[#0a47b8]"
                }`}
              >
                {ocorrencia.confirmadoPorMim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[13px]">Confirmado</p>
                  </>
                ) : (
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[14px]">Confirmar problema</p>
                )}
              </button>

              <button className="flex-1 rounded-[16px] py-[14px] bg-white border border-[#d7e3f0] outline-none cursor-pointer active:opacity-80 transition-opacity">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Compartilhar</p>
              </button>
            </div>

            {ocorrencia.confirmadoPorMim && (
              <div className="bg-[#e8f0fe] rounded-[12px] px-[14px] py-[10px] w-full">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[12px] text-center">
                  Obrigado! Sua confirmação ajuda a priorizar esta ocorrência.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
