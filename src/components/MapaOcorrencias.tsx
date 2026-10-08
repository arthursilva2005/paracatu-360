import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { OcorrenciaHome } from "@/lib/ocorrencias";
import { calcularRelevancia, METADADOS_STATUS } from "@/data/ocorrencias";
import { resolverCategoria, type CategoriaOcorrencia } from "@/hooks/useCategorias";
import {
  calcularTiles, CENTRO_PARACATU, desprojetar, deslocamentoHorizontal, projetar,
  TAMANHO_TILE, type PixelMapa, type PontoMapa,
} from "@/lib/projecaoMapa";

export type OcorrenciaNoMapa = OcorrenciaHome & { latitude: number; longitude: number };

type Props = {
  ocorrencias: OcorrenciaNoMapa[];
  categorias: CategoriaOcorrencia[];
  categoriasLoading: boolean;
  carregando: boolean;
  erro: boolean;
  onOpenDetalhe: (id: string) => void;
};

type Gesto = { x: number; y: number; centro: PixelMapa; moveu: boolean };
type PosicaoMarcador = { ocorrencia: OcorrenciaNoMapa; x: number; y: number };

const CORES_RELEVANCIA = { alta: "#dc2626", media: "#d97706", baixa: "#075ce5" };

export default function MapaOcorrencias({ ocorrencias, categorias, categoriasLoading, carregando, erro, onOpenDetalhe }: Props) {
  const mapaRef = useRef<HTMLDivElement>(null);
  const gestoRef = useRef<Gesto | null>(null);
  const enquadrouRef = useRef(false);
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });
  const [centro, setCentro] = useState<PontoMapa>(CENTRO_PARACATU);
  const [zoom, setZoom] = useState(15);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [erroTiles, setErroTiles] = useState(false);

  useEffect(() => {
    const elemento = mapaRef.current;
    if (!elemento) return;
    const observar = () => setTamanho({
      largura: elemento.clientWidth,
      altura: elemento.clientHeight,
    });
    observar();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", observar);
      return () => window.removeEventListener("resize", observar);
    }
    const observer = new ResizeObserver(observar);
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (enquadrouRef.current || !ocorrencias.length || !tamanho.largura || !tamanho.altura) return;
    const pixels = ocorrencias.map(ocorrencia => projetar(ocorrencia, 0));
    const minX = Math.min(...pixels.map(pixel => pixel.x));
    const maxX = Math.max(...pixels.map(pixel => pixel.x));
    const minY = Math.min(...pixels.map(pixel => pixel.y));
    const maxY = Math.max(...pixels.map(pixel => pixel.y));
    const larguraUtil = Math.max(1, tamanho.largura - 96);
    const alturaUtil = Math.max(1, tamanho.altura - 96);
    let novoZoom = 17;
    while (novoZoom > 3 &&
      ((maxX - minX) * 2 ** novoZoom > larguraUtil ||
        (maxY - minY) * 2 ** novoZoom > alturaUtil)) {
      novoZoom--;
    }
    setCentro(desprojetar({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, 0));
    setZoom(novoZoom);
    enquadrouRef.current = true;
  }, [ocorrencias, tamanho.largura, tamanho.altura]);

  const centroPx = projetar(centro, zoom);
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const tiles = calcularTiles(centroPx, zoom, tamanho.largura, tamanho.altura);
  const marcadores: PosicaoMarcador[] = ocorrencias.map(ocorrencia => {
    const pixel = projetar(ocorrencia, zoom);
    return {
      ocorrencia,
      x: tamanho.largura / 2 + deslocamentoHorizontal(pixel.x, centroPx.x, mundo),
      y: tamanho.altura / 2 + pixel.y - centroPx.y,
    };
  }).filter(marcador =>
    marcador.x >= -16 && marcador.x <= tamanho.largura + 16 &&
    marcador.y >= -16 && marcador.y <= tamanho.altura + 16
  );
  const selecionada = marcadores.find(marcador => marcador.ocorrencia.id === selecionadaId);

  function iniciarGesto(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    gestoRef.current = {
      x: event.clientX,
      y: event.clientY,
      centro: centroPx,
      moveu: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moverGesto(event: PointerEvent<HTMLDivElement>) {
    const gesto = gestoRef.current;
    if (!gesto) return;
    const deltaX = event.clientX - gesto.x;
    const deltaY = event.clientY - gesto.y;
    if (Math.hypot(deltaX, deltaY) > 4) gesto.moveu = true;
    if (gesto.moveu) {
      setCentro(desprojetar({
        x: gesto.centro.x - deltaX,
        y: gesto.centro.y - deltaY,
      }, zoom));
    }
  }

  function terminarGesto(event: PointerEvent<HTMLDivElement>) {
    if (gestoRef.current && !gestoRef.current.moveu) setSelecionadaId(null);
    gestoRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function cancelarGesto(event: PointerEvent<HTMLDivElement>) {
    gestoRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const categoriaSelecionada = selecionada &&
    resolverCategoria(selecionada.ocorrencia.categoriaId, categorias);
  const popupAbaixo = !!selecionada && selecionada.y < 155;
  const popupX = selecionada
    ? Math.max(8, Math.min(tamanho.largura - 248, selecionada.x - 120))
    : 8;

  return (
    <div
      ref={mapaRef}
      role="application"
      aria-label="Mapa de ocorrências"
      className="map-real relative h-[280px] min-w-0 w-full overflow-hidden rounded-[20px] bg-[#eaf0f7] select-none"
      style={{ touchAction: "none", cursor: "grab" }}
      onPointerDown={iniciarGesto}
      onPointerMove={moverGesto}
      onPointerUp={terminarGesto}
      onPointerCancel={cancelarGesto}
    >
      {tiles.map(tile => (
        <img
          key={zoom + ":" + tile.x + ":" + tile.y}
          src={"https://tile.openstreetmap.org/" + zoom + "/" + tile.x + "/" + tile.y + ".png"}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={event => {
            event.currentTarget.style.visibility = "hidden";
            setErroTiles(true);
          }}
          className="absolute max-w-none"
          style={{ width: TAMANHO_TILE, height: TAMANHO_TILE, left: tile.esquerda, top: tile.topo }}
        />
      ))}
      {marcadores.map(marcador => {
        const relevancia = calcularRelevancia(marcador.ocorrencia.quantidadeConfirmacoes);
        return (
          <button
            key={marcador.ocorrencia.id}
            type="button"
            aria-label={"Mostrar " + marcador.ocorrencia.titulo + " no mapa"}
            aria-pressed={selecionadaId === marcador.ocorrencia.id}
            onPointerDown={event => event.stopPropagation()}
            onClick={() => setSelecionadaId(marcador.ocorrencia.id)}
            className="absolute z-[1] flex size-[32px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[12px] border-[2px] border-white shadow-[0_3px_7px_rgba(0,0,0,0.25)] cursor-pointer"
            style={{ left: marcador.x, top: marcador.y, backgroundColor: CORES_RELEVANCIA[relevancia] }}
          >
            <span className="size-[8px] rounded-full bg-white" />
          </button>
        );
      })}
      {selecionada && (
        <div
          onPointerDown={event => event.stopPropagation()}
          className="absolute z-[3] w-[240px] max-w-[calc(100%-16px)] rounded-[12px] bg-white p-[12px] shadow-[0_4px_16px_rgba(16,40,74,0.25)]"
          style={{
            left: popupX,
            top: popupAbaixo ? selecionada.y + 20 : selecionada.y - 20,
            transform: popupAbaixo ? undefined : "translateY(-100%)",
          }}
        >
          <p className="text-[#075ce5] text-[11px]">
            {categoriaSelecionada?.nome ?? (categoriasLoading ? "Carregando categoria" : "Categoria indisponível")}
            {" · " + METADADOS_STATUS[selecionada.ocorrencia.status].label}
          </p>
          <p className="mt-[5px] text-[#10284a] text-[13px] font-bold break-words">
            {selecionada.ocorrencia.titulo}
          </p>
          <p className="mt-[4px] text-[#586a80] text-[11px] break-words">
            {selecionada.ocorrencia.bairro + " · " + selecionada.ocorrencia.endereco}
          </p>
          <p className="mt-[4px] text-[#586a80] text-[11px]">
            {selecionada.ocorrencia.quantidadeConfirmacoes} confirmações
          </p>
          <button
            type="button"
            onClick={() => onOpenDetalhe(selecionada.ocorrencia.id)}
            className="mt-[8px] rounded-[8px] bg-[#075ce5] px-[12px] py-[7px] text-[12px] font-semibold text-white cursor-pointer"
          >
            Ver ocorrência
          </button>
        </div>
      )}
      <div
        className="absolute left-[12px] top-[12px] z-[2] rounded-full bg-white/95 px-[10px] py-[7px] text-[#10284a] text-[12px] shadow"
        onPointerDown={event => event.stopPropagation()}
      >
        {carregando ? "Carregando ocorrências..." : erro ? "Ocorrências indisponíveis" :
          ocorrencias.length + (ocorrencias.length === 1 ? " ocorrência" : " ocorrências") + " no mapa"}
      </div>
      <div className="absolute right-[12px] top-[12px] z-[2] flex flex-col gap-[4px]">
        <button type="button" aria-label="Aproximar mapa" disabled={zoom >= 19}
          onPointerDown={event => event.stopPropagation()}
          onClick={() => { setZoom(atual => Math.min(19, atual + 1)); setErroTiles(false); }}
          className="size-[36px] rounded-[8px] bg-white text-[#10284a] text-[22px] shadow cursor-pointer disabled:opacity-50">+</button>
        <button type="button" aria-label="Afastar mapa" disabled={zoom <= 3}
          onPointerDown={event => event.stopPropagation()}
          onClick={() => { setZoom(atual => Math.max(3, atual - 1)); setErroTiles(false); }}
          className="size-[36px] rounded-[8px] bg-white text-[#10284a] text-[22px] shadow cursor-pointer disabled:opacity-50">−</button>
      </div>
      <div className="absolute bottom-[9px] left-[9px] z-[2] rounded bg-white/95 px-[5px] text-[10px] text-[#10284a]">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
          onPointerDown={event => event.stopPropagation()} className="underline">OpenStreetMap</a> contributors
      </div>
      <div className="absolute bottom-[34px] sm:bottom-[9px] right-[9px] z-[2] flex gap-[8px] rounded-[8px] bg-white/95 px-[7px] py-[5px] text-[10px] text-[#10284a]">
        <span><span className="text-[#dc2626]">●</span> Alta</span>
        <span><span className="text-[#d97706]">●</span> Média</span>
        <span><span className="text-[#075ce5]">●</span> Baixa</span>
      </div>
      {erroTiles && (
        <p role="alert" className="absolute bottom-[32px] left-[9px] z-[2] rounded bg-white/95 px-[6px] py-[4px] text-[#586a80] text-[11px]">
          Parte do mapa não carregou.
        </p>
      )}
    </div>
  );
}
