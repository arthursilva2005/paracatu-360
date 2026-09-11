import { Ocorrencia, calcularRelevancia, CategoriaOcorrencia } from "@/data/ocorrencias";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onBack: () => void;
  onOpenDetalhe: (id: string) => void;
  ocorrencias: Ocorrencia[];
};

type KPIProps = { valor: string | number; label: string; cor: string; icon: React.ReactNode };

function KPI({ valor, label, cor, icon }: KPIProps) {
  return (
    <div className="bg-white rounded-[16px] flex-1 p-[14px] flex flex-col gap-[8px] border border-[#e8eef5]">
      <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center ${cor}`}>
        {icon}
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px] leading-none">{valor}</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[11px] leading-tight">{label}</p>
    </div>
  );
}

const catColors: Record<CategoriaOcorrencia, string> = {
  Vias:        "#075ce5",
  Iluminação:  "#d97706",
  Limpeza:     "#16a34a",
  Segurança:   "#dc2626",
  Outros:      "#7c3aed",
};

const statusColors: Record<string, { bg: string; label: string }> = {
  "Em análise":     { bg: "#d97706", label: "Em análise" },
  "Em atendimento": { bg: "#7c3aed", label: "Em atendimento" },
  "Encaminhado":    { bg: "#075ce5", label: "Encaminhado" },
  "Resolvido":      { bg: "#16a34a", label: "Resolvido" },
};

export default function Dashboard({ activeTab, onNavigate, onBack, onOpenDetalhe, ocorrencias }: Props) {
  const total = ocorrencias.length;
  const resolvidos = ocorrencias.filter(o => o.status === "Resolvido").length;
  const emAndamento = ocorrencias.filter(o => o.status === "Em atendimento").length;
  const altaRel = ocorrencias.filter(o => calcularRelevancia(o.confirmacoes) === "alta").length;
  const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;
  const totalConfirmacoes = ocorrencias.reduce((acc, o) => acc + o.confirmacoes, 0);

  // Distribuição por categoria
  const porCategoria = (["Vias", "Iluminação", "Limpeza", "Segurança", "Outros"] as CategoriaOcorrencia[]).map(cat => ({
    cat,
    count: ocorrencias.filter(o => o.categoria === cat).length,
    color: catColors[cat],
  }));
  const maxCat = Math.max(...porCategoria.map(c => c.count), 1);

  // Distribuição por status
  const porStatus = Object.entries(statusColors).map(([status, meta]) => ({
    status,
    label: meta.label,
    bg: meta.bg,
    count: ocorrencias.filter(o => o.status === status).length,
  }));

  // Top por relevância
  const topOcorrencias = [...ocorrencias]
    .sort((a, b) => b.confirmacoes - a.confirmacoes)
    .slice(0, 3);

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />

      {/* Barra de volta */}
      <div className="bg-white w-full px-[16px] py-[10px] flex items-center gap-[8px] border-b border-[#e8eef5]">
        <button
          onClick={onBack}
          className="flex items-center gap-[6px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[7px] border-none outline-none cursor-pointer active:opacity-70"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#075ce5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[13px]">Voltar</p>
        </button>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] ml-[4px]">Inteligência urbana</p>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col gap-[20px] p-[22px] w-full pb-[16px]">

          {/* Cabeçalho do dashboard */}
          <div className="flex flex-col gap-[4px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px]">Dashboard 360</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">
              Visão geral da cidade em tempo real.
            </p>
          </div>

          {/* KPIs — linha 1 */}
          <div className="flex gap-[10px] w-full">
            <KPI
              valor={total}
              label="Total de ocorrências"
              cor="bg-[#e8f0fe]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#075ce5" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={resolvidos}
              label="Resolvidas"
              cor="bg-[#dcfce7]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={`${taxaResolucao}%`}
              label="Taxa de resolução"
              cor="bg-[#fef9c3]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
          </div>

          {/* KPIs — linha 2 */}
          <div className="flex gap-[10px] w-full -mt-[10px]">
            <KPI
              valor={emAndamento}
              label="Em atendimento"
              cor="bg-[#f3e8ff]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={altaRel}
              label="Alta relevância"
              cor="bg-[#fee2e2]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
            <KPI
              valor={totalConfirmacoes}
              label="Total confirmações"
              cor="bg-[#e0f2fe]"
              icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round"/></svg>}
            />
          </div>

          {/* Distribuição por categoria */}
          <div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[14px] border border-[#e8eef5]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Ocorrências por categoria</p>
            {porCategoria.map(({ cat, count, color }) => (
              <div key={cat} className="flex flex-col gap-[5px]">
                <div className="flex items-center justify-between">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#10284a] text-[13px]">{cat}</p>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{count}</p>
                </div>
                <div className="w-full bg-[#f3f6fa] rounded-full h-[8px] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCat) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status overview */}
          <div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] border border-[#e8eef5]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Status das ocorrências</p>
            <div className="flex flex-wrap gap-[8px]">
              {porStatus.map(({ status, label, bg, count }) => (
                <div key={status} className="flex items-center gap-[7px] bg-[#f3f6fa] rounded-[10px] px-[12px] py-[8px]">
                  <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: bg }} />
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">{label}</p>
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">{count}</p>
                </div>
              ))}
            </div>

            {/* Barra visual de status */}
            <div className="w-full h-[10px] rounded-full overflow-hidden flex">
              {porStatus.filter(s => s.count > 0).map(({ status, bg, count }) => (
                <div
                  key={status}
                  className="h-full transition-all"
                  style={{ width: `${(count / total) * 100}%`, backgroundColor: bg }}
                />
              ))}
            </div>
          </div>

          {/* Bairros mais ativos (estático ilustrativo) */}
          <div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[12px] border border-[#e8eef5]">
            <div className="flex items-center justify-between">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Bairros mais ativos</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px]">Ilustrativo</p>
            </div>
            {[
              { bairro: "Centro", count: 3, pct: 60 },
              { bairro: "Bairro do Piloto", count: 1, pct: 20 },
              { bairro: "Bairro São João", count: 1, pct: 20 },
            ].map(({ bairro, count, pct }) => (
              <div key={bairro} className="flex items-center gap-[10px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] w-[130px] shrink-0">{bairro}</p>
                <div className="flex-1 bg-[#f3f6fa] rounded-full h-[7px] overflow-hidden">
                  <div className="h-full bg-[#075ce5] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[12px] w-[16px] text-right">{count}</p>
              </div>
            ))}
          </div>

          {/* Top ocorrências */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Mais confirmadas</p>
              <button
                onClick={() => onNavigate("inicio")}
                className="bg-transparent border-none outline-none cursor-pointer"
              >
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#075ce5] text-[12px]">Ver todas</p>
              </button>
            </div>
            {topOcorrencias.map(o => (
              <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => onOpenDetalhe(o.id)} />
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => onNavigate("nova")}
            className="bg-[#075ce5] hover:bg-[#0a47b8] active:scale-[0.98] w-full rounded-[16px] py-[15px] border-none outline-none cursor-pointer transition-all"
          >
            <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[15px]">Registrar nova ocorrência</p>
          </button>

        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
