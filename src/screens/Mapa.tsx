import { useEffect, useState } from "react";
import type { OcorrenciaHome } from "@/lib/ocorrencias";
import { listarOcorrenciasPublicas } from "@/lib/ocorrencias";
import type { EstadoCategorias } from "@/hooks/useCategorias";
import { useAuth } from "@/context/AuthContext";
import OcorrenciaCard from "@/components/OcorrenciaCard";
import FiltroCategorias from "@/components/FiltroCategorias";
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
  recarregarCategorias,
}: Props) {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaHome[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
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
  }, [user?.id, tentativa]);

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
          <div className="map-left-column">
          <p className="map-hint w-full text-[#586a80] text-[12px]">Selecione um ponto no mapa para ver a ocorrência.</p>
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
            <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[18px] w-full lg:hidden">Filtros</p>
            <div className="w-full lg:hidden">
              <FiltroCategorias categorias={categorias} selecionada={categoriaFiltro} onSelecionar={setCategoriaFiltro} />
            </div>
            <div className="hidden lg:flex flex-col gap-[6px] w-full">
              <label htmlFor="mapa-categoria" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Categoria</label>
              <select id="mapa-categoria" value={categoriaFiltro} onChange={event => setCategoriaFiltro(event.target.value)}
                className="w-full rounded-[12px] border border-[#d7e3f0] bg-white px-[12px] py-[11px] text-[#10284a] text-[13px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075ce5]">
                <option value="">Todas</option>
                {categorias.map(categoria => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </select>
            </div>
            {categoriasLoading && (
              <p className="text-[#586a80] text-[12px]">Carregando categorias...</p>
            )}
            {!categoriasLoading && categoriasError && (
              <div className="flex flex-wrap items-center gap-[8px]">
                <p role="alert" className="text-[#586a80] text-[12px]">{categoriasError}</p>
                <button type="button" onClick={recarregarCategorias} className="rounded-[10px] border border-[#075ce5] bg-white px-[12px] py-[8px] text-[#075ce5] text-[12px] font-semibold cursor-pointer">Tentar novamente</button>
              </div>
            )}
            {!categoriasLoading && !categoriasError && categorias.length === 0 && (
              <p className="text-[#586a80] text-[12px]">Nenhuma categoria disponível no momento.</p>
            )}
          </div>

          <button type="button" className="map-action hidden lg:block bg-[#ffcc36] relative rounded-[16px] shrink-0 w-full cursor-pointer active:opacity-90"
            onClick={() => onNavigate("nova")}>
            <span className="block p-[14px] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[14px] text-center">
              Registrar problema
            </span>
          </button>
          </div>

          <div className="map-right-column">
            <div className="map-list content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] text-[#10284a] text-[18px] w-full">Ocorrências no mapa</p>
              {carregando ? (
                <p role="status" className="w-full rounded-[16px] bg-white p-[20px] text-[#586a80] text-[14px]">Carregando ocorrências...</p>
              ) : erro ? (
                <div role="alert" className="w-full rounded-[16px] bg-white p-[20px] flex flex-col items-start gap-[12px]">
                  <p className="text-[#586a80] text-[14px]">Não foi possível carregar as ocorrências no mapa agora.</p>
                  <button type="button" onClick={() => setTentativa(atual => atual + 1)}
                    className="rounded-[12px] bg-[#075ce5] px-[16px] py-[10px] text-white text-[13px] font-semibold cursor-pointer">
                    Tentar novamente
                  </button>
                </div>
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
          </div>
        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
