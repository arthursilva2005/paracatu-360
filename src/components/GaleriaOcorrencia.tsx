import { useState } from "react";
import type { FotoOcorrenciaLeitura } from "@/lib/fotosOcorrencias";

type Props = { fotos: FotoOcorrenciaLeitura[]; titulo: string };

export default function GaleriaOcorrencia({ fotos, titulo }: Props) {
  const [ordemSelecionada, setOrdemSelecionada] = useState(1);
  const [urlsComErro, setUrlsComErro] = useState<string[]>([]);
  const selecionada = fotos.find(item => item.foto.ordem === ordemSelecionada);
  const url = selecionada?.url;

  return (
    <section aria-label="Fotos da ocorrência" className="flex flex-col gap-[10px] min-w-0 w-full">
      <div className="relative aspect-[4/3] max-h-[360px] overflow-hidden rounded-[12px] bg-[#eaf0f7] w-full">
        {url && !urlsComErro.includes(url) ? (
          <img src={url} alt={`${titulo} — foto ${ordemSelecionada}`}
            className="absolute inset-0 size-full object-contain"
            onError={() => setUrlsComErro(anteriores => [...anteriores, url])} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] text-[#586a80]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <path d="m4 17 5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px]">Foto indisponível</span>
          </div>
        )}
      </div>
      {(fotos.length > 1 || (fotos.length === 1 && fotos[0].foto.ordem !== 1)) && (
        <div className="flex flex-wrap gap-[8px]" aria-label="Selecionar foto">
          {fotos.map(item => (
            <button key={item.foto.id} type="button"
              aria-pressed={ordemSelecionada === item.foto.ordem}
              onClick={() => setOrdemSelecionada(item.foto.ordem)}
              className={`rounded-[10px] px-[14px] py-[10px] text-[13px] cursor-pointer ${
                ordemSelecionada === item.foto.ordem ? "bg-[#075ce5] text-white" : "bg-[#f3f6fa] text-[#10284a]"
              }`}>
              Foto {item.foto.ordem}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
