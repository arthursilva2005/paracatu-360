import { useEffect, useState } from "react";
import type { OcorrenciaHome } from "@/lib/ocorrencias";
import { listarOcorrenciasPublicas } from "@/lib/ocorrencias";
import type { EstadoCategorias } from "@/hooks/useCategorias";
import { useAuth } from "@/context/AuthContext";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import MapaOcorrencias, { type OcorrenciaNoMapa } from "@/components/MapaOcorrencias";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { type TabName } from "@/components/Navegacao";

type Props = EstadoCategorias & {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onOpenDetalhe: (id: string) => void;
};

function possuiCoordenadasValidas(ocorrencia: OcorrenciaHome): ocorrencia is OcorrenciaNoMapa {
  const { latitude, longitude } = ocorrencia;
  return latitude !== null && longitude !== null &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;
}

export default function Mapa({
  activeTab,
  onNavigate,
  onOpenDetalhe,
  categorias,
  categoriasLoading,
  categoriasError,
}: Props) {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaHome[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);
    setOcorrencias([]);

    void listarOcorrenciasPublicas({ incluirCapas: false }).then(lista => {
      if (ativo) setOcorrencias(lista);
    }).catch(() => {
      if (ativo) setErro(true);
    }).finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => { ativo = false; };
  }, [user?.id]);

  const localizadas = ocorrencias.filter(possuiCoordenadasValidas);
  const filtradas = categoriaFiltro
    ? localizadas.filter(ocorrencia => ocorrencia.categoriaId === categoriaFiltro)
    : localizadas;
  const ordenadas = [...filtradas].sort((a, b) =>
    b.quantidadeConfirmacoes - a.quantidadeConfirmacoes ||
    new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content layout-mapa content-stretch flex flex-col gap-[16px] items-start p-[22px] relative w-full">
          <MapaOcorrencias
            key={categoriaFiltro}
            ocorrencias={filtradas}
            categorias={categorias}
            categoriasLoading={categoriasLoading}
            carregando={carregando}
            erro={erro}
            onOpenDetalhe={onOpenDetalhe}
          />

          <div className="map-filters content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[18px] w-full">Filtros</p>
            <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full">
              <button type="button" onClick={() => setCategoriaFiltro("")} aria-pressed={categoriaFiltro === ""}
                className={"relative rounded-[999px] px-[12px] py-[8px] text-[13px] font-semibold cursor-pointer " +
                  (categoriaFiltro === "" ? "bg-[#075ce5] text-white" : "bg-white text-[#10284a] border border-[#d7e3f0]")}>
                Todas
              </button>
              {categorias.map(categoria => (
                <button key={categoria.id} type="button" onClick={() => setCategoriaFiltro(categoria.id)}
                  aria-pressed={categoriaFiltro === categoria.id}
                  className={"relative rounded-[999px] px-[12px] py-[8px] text-[13px] font-semibold cursor-pointer " +
                    (categoriaFiltro === categoria.id ? "bg-[#075ce5] text-white" : "bg-white text-[#10284a] border border-[#d7e3f0]")}>
                  {categoria.nome}
                </button>
              ))}
            </div>
            {categoriasLoading && (
              <p className="text-[#586a80] text-[12px]">Carregando categorias...</p>
            )}
            {!categoriasLoading && categoriasError && (
              <p role="alert" className="text-[#586a80] text-[12px]">{categoriasError}</p>
            )}
            {!categoriasLoading && !categoriasError && categorias.length === 0 && (
              <p className="text-[#586a80] text-[12px]">Nenhuma categoria disponível no momento.</p>
            )}
          </div>

          <div className="map-list content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[18px] w-full">Ocorrências no mapa</p>
            {carregando ? (
              <p role="status" className="w-full rounded-[16px] bg-white p-[20px] text-[#586a80] text-[14px]">Carregando ocorrências...</p>
            ) : erro ? (
              <p role="alert" className="w-full rounded-[16px] bg-white p-[20px] text-[#586a80] text-[14px]">Não foi possível carregar as ocorrências no mapa agora.</p>
            ) : ordenadas.length === 0 ? (
              <p className="w-full rounded-[16px] bg-white p-[20px] text-[#586a80] text-[14px]">
                {categoriaFiltro ? "Nenhuma ocorrência nesta categoria com localização disponível." :
                  "Nenhuma ocorrência com localização disponível."}
              </p>
            ) : ordenadas.map(ocorrencia => (
              <OcorrenciaCard key={ocorrencia.id} ocorrencia={ocorrencia}
                categorias={categorias} categoriasLoading={categoriasLoading} exibirDataReal
                onClick={() => onOpenDetalhe(ocorrencia.id)} />
            ))}
          </div>

          <button type="button" className="map-action bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90"
            onClick={() => onNavigate("nova")}>
            <span className="block p-[14px] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[14px] text-center">
              Registrar problema
            </span>
          </button>
        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
