import { useState } from "react";
import { Ocorrencia, calcularRelevancia, corRelevancia, labelRelevancia, localOcorrencia, tempoOcorrencia, METADADOS_STATUS } from "@/data/ocorrencias";
import { CategoriaOcorrencia, resolverCategoria } from "@/hooks/useCategorias";

type Props = {
  ocorrencia: Ocorrencia;
  categorias: CategoriaOcorrencia[];
  categoriasLoading: boolean;
  onClick?: () => void;
  showRelevancia?: boolean;
  exibirFoto?: boolean;
  fotoPrincipalUrl?: string | null;
};

export default function OcorrenciaCard({ ocorrencia, categorias, categoriasLoading, onClick, showRelevancia = true, exibirFoto = false, fotoPrincipalUrl }: Props) {
  const [urlComErro, setUrlComErro] = useState<string | null>(null);
  const { status, titulo, quantidadeConfirmacoes: confirmacoes } = ocorrencia;
  const categoria = resolverCategoria(ocorrencia.categoriaId, categorias);
  const categoriaNome = categoria?.nome
    ?? (categoriasLoading ? "Carregando categoria" : "Categoria indisponível");
  const local = localOcorrencia(ocorrencia);
  const dataCriacao = new Date(ocorrencia.criadoEm);
  const tempo = exibirFoto
    ? (Number.isNaN(dataCriacao.getTime()) ? "Data indisponível" : dataCriacao.toLocaleDateString("pt-BR"))
    : tempoOcorrencia(ocorrencia);
  const relevancia = calcularRelevancia(confirmacoes);
  const cor = corRelevancia[relevancia];

  return (
    <div
      className="occurrence-card bg-white relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {exibirFoto && (
        <div className="relative aspect-[2/1] max-h-[220px] w-full overflow-hidden rounded-t-[16px] bg-[#eaf0f7]">
          {fotoPrincipalUrl && urlComErro !== fotoPrincipalUrl ? (
            <img src={fotoPrincipalUrl} alt={titulo} loading="lazy"
              className="absolute inset-0 size-full object-cover"
              onError={() => setUrlComErro(fotoPrincipalUrl)} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] text-[#586a80]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <path d="m4 17 5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px]">Foto indisponível</span>
            </div>
          )}
        </div>
      )}
      <div className={`[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic p-[16px] relative ${exibirFoto ? "w-full" : "size-full"}`}>
        {/* Linha superior: categoria + badge relevância */}
        <div className="flex items-center justify-between w-full gap-[8px]">
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[12px]">
            {categoriaNome} · {METADADOS_STATUS[status].label}
          </p>
          {showRelevancia && (
            <div className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-[999px] shrink-0 ${cor.bg}`}>
              <div className={`w-[5px] h-[5px] rounded-full shrink-0 ${cor.dot}`} />
              <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] whitespace-nowrap ${cor.text}`}>
                {labelRelevancia[relevancia]}
              </p>
            </div>
          )}
        </div>

        <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[16px] w-full">{titulo}</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] w-full">{local}</p>

        {/* Linha inferior: confirmações + tempo */}
        <div className={`flex items-center justify-between w-full ${exibirFoto ? "flex-wrap gap-[8px]" : ""}`}>
          <div className="flex items-center gap-[4px]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM7 11.5L3.5 8L4.56 6.94L7 9.37L11.44 4.93L12.5 6L7 11.5Z" fill="#075ce5" opacity="0.7"/>
            </svg>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
              {confirmacoes} confirmações
            </p>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">{tempo}</p>
        </div>
      </div>
    </div>
  );
}
