import { useState } from "react";
import svgPaths from "../../imports/svg-4r6l0jr5e2";
import { Ocorrencia, CategoriaOcorrencia } from "@/data/ocorrencias";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onRegistrar: (nova: Omit<Ocorrencia, "id" | "confirmadoPorMim">) => void;
};

const CATEGORIAS: CategoriaOcorrencia[] = ["Vias", "Iluminação", "Limpeza", "Segurança", "Outros"];

function MapPin() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 20 20">
        <path d={svgPaths.p337915b0} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
      <g clipPath="url(#clip-edit2)">
        <path d={svgPaths.p29f8df00} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs><clipPath id="clip-edit2"><rect fill="white" height="16" width="16" /></clipPath></defs>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p37770280} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p2c44b300} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p83a900} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function Sucesso({ titulo, categoria, onAcompanhar, onNova }: {
  titulo: string; categoria: string; onAcompanhar: () => void; onNova: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-[28px] gap-[24px] text-center">
      <div className="w-[80px] h-[80px] rounded-full bg-[#e8f5e9] flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="#22c55e" opacity="0.15"/>
          <path d="M12 20l6 6 10-12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px]">Ocorrência registrada!</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[14px] leading-relaxed">
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a]">"{titulo}"</span> foi enviada como{" "}
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5]">{categoria}</span>.
          <br/>Você receberá atualizações sobre o andamento.
        </p>
      </div>
      <div className="flex flex-col gap-[10px] w-full">
        <button
          onClick={onAcompanhar}
          className="bg-[#075ce5] hover:bg-[#0a47b8] active:scale-[0.98] w-full rounded-[16px] py-[15px] cursor-pointer border-none outline-none transition-all"
        >
          <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[15px]">Acompanhar ocorrência</p>
        </button>
        <button
          onClick={onNova}
          className="bg-white w-full rounded-[16px] py-[15px] cursor-pointer border border-[#d7e3f0] outline-none active:opacity-80 transition-all"
        >
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Registrar outra</p>
        </button>
      </div>
    </div>
  );
}

export default function NovaOcorrencia({ activeTab, onNavigate, onRegistrar }: Props) {
  const [categoria, setCategoria] = useState<CategoriaOcorrencia>("Vias");
  const [descricao, setDescricao] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [tituloRegistrado, setTituloRegistrado] = useState("");

  function handleRegistrar() {
    const titulo = descricao.trim().split("\n")[0].slice(0, 60) || `Problema em ${categoria}`;
    setTituloRegistrado(titulo);
    onRegistrar({
      categoria,
      status: "Em análise",
      titulo,
      local: "Centro · Rua da Praça",
      descricao: descricao || "Sem descrição.",
      confirmacoes: 0,
      tempo: "Agora mesmo",
    });
    setSucesso(true);
  }

  return (
    <div className="bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full" data-name="02 · Nova ocorrência">
      <Cabecalho />
      <div className="flex-1 overflow-y-auto w-full flex flex-col">
        {sucesso ? (
          <Sucesso
            titulo={tituloRegistrado}
            categoria={categoria}
            onAcompanhar={() => onNavigate("atividade")}
            onNova={() => { setSucesso(false); setDescricao(""); setCategoria("Vias"); }}
          />
        ) : (
          <div className="content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

            {/* Introdução */}
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[24px] w-full">Nova ocorrência</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[14px] w-full">Descreva o problema, adicione fotos e escolha o local para abrir o registro.</p>
            </div>

            {/* Categoria — interativa */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Qual é a categoria?</p>
              <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`px-[12px] py-[8px] rounded-[999px] border-none outline-none cursor-pointer transition-all ${
                      categoria === cat
                        ? "bg-[#075ce5]"
                        : "bg-white border border-[#d7e3f0]"
                    }`}
                  >
                    <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[13px] whitespace-nowrap ${categoria === cat ? "text-white" : "text-[#10284a]"}`}>
                      {cat}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Local */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Onde aconteceu?</p>
              <div className="bg-white content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full border border-[#d7e3f0]">
                <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                  <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[12px] shrink-0 size-[40px]">
                    <MapPin />
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative">
                    <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">Centro · Rua da Praça</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">Local aproximado sugerido pelo GPS</p>
                  </div>
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#586A80" strokeLinecap="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="bg-[#f3f6fa] content-stretch flex gap-[8px] items-center px-[12px] py-[10px] relative rounded-[12px] shrink-0 w-full cursor-pointer">
                  <EditIcon />
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.45] min-w-px not-italic relative text-[#075ce5] text-[13px]">Ajustar local no mapa</p>
                </div>
              </div>
            </div>

            {/* Descrição — textarea real */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px]">Descreva o problema</p>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#9aafc4] text-[11px]">{descricao.length}/300</p>
              </div>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value.slice(0, 300))}
                maxLength={300}
                placeholder="Descreva o que está acontecendo, onde exatamente o problema está e qualquer detalhe importante..."
                className="bg-white w-full h-[130px] rounded-[16px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] resize-none leading-relaxed"
              />
            </div>

            {/* Fotos */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Adicione fotos ou vídeo</p>
              <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
                {[
                  { icon: <CameraIcon />, label: "Câmera" },
                  { icon: <ImageIcon />, label: "Galeria" },
                  { icon: <VideoIcon />, label: "Vídeo" },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[96px] cursor-pointer active:opacity-80 gap-[4px] border border-dashed border-[#d7e3f0]">
                    {icon}
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#586a80] text-[11px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Registrar */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full pb-[8px]">
              <button
                onClick={handleRegistrar}
                className="bg-[#ffcc36] hover:bg-[#f0bb20] active:scale-[0.98] w-full rounded-[16px] py-[15px] cursor-pointer border-none outline-none transition-all"
              >
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px] text-center">Registrar problema</p>
              </button>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] text-center w-full">
                Ao registrar, você receberá atualizações sobre o andamento do caso.
              </p>
            </div>

          </div>
        )}
      </div>
      {!sucesso && <Navegacao activeTab={activeTab} onNavigate={onNavigate} />}
    </div>
  );
}
