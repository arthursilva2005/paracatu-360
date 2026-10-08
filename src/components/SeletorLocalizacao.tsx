import { useEffect, useRef, useState, type PointerEvent } from "react";

export type PontoLocalizacao = { latitude: number; longitude: number };

type Props = {
  ponto: PontoLocalizacao | null;
  centralizarEm: PontoLocalizacao | null;
  desabilitado: boolean;
  onChange: (ponto: PontoLocalizacao) => void;
};

type Pixel = { x: number; y: number };
type Gesto = {
  tipo: "mapa" | "marcador";
  x: number;
  y: number;
  centro: Pixel;
  moveu: boolean;
};

const TAMANHO_TILE = 256;
const LATITUDE_MAXIMA = 85.05112878;
// Centro histórico de Paracatu: apenas enquadramento inicial, nunca ponto da ocorrência.
const CENTRO_INICIAL: PontoLocalizacao = { latitude: -17.224106, longitude: -46.874352 };

function projetar(ponto: PontoLocalizacao, zoom: number): Pixel {
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const latitude = Math.max(-LATITUDE_MAXIMA, Math.min(LATITUDE_MAXIMA, ponto.latitude));
  const radianos = latitude * Math.PI / 180;
  return {
    x: (ponto.longitude + 180) / 360 * mundo,
    y: (1 - Math.asinh(Math.tan(radianos)) / Math.PI) / 2 * mundo,
  };
}

function desprojetar(pixel: Pixel, zoom: number): PontoLocalizacao {
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const longitude = ((pixel.x / mundo * 360) % 360 + 360) % 360 - 180;
  const y = Math.max(0, Math.min(mundo, pixel.y));
  const latitude = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / mundo))) * 180 / Math.PI;
  return { latitude, longitude };
}

export default function SeletorLocalizacao({
  ponto, centralizarEm, desabilitado, onChange,
}: Props) {
  const mapaRef = useRef<HTMLDivElement>(null);
  const gestoRef = useRef<Gesto | null>(null);
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });
  const [centro, setCentro] = useState<PontoLocalizacao>(CENTRO_INICIAL);
  const [zoom, setZoom] = useState(15);
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
    if (!centralizarEm) return;
    setCentro(centralizarEm);
    setZoom(17);
    setErroTiles(false);
  }, [centralizarEm]);

  const centroPx = projetar(centro, zoom);
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const tiles: { x: number; y: number; esquerda: number; topo: number }[] = [];
  if (tamanho.largura && tamanho.altura) {
    const inicioX = Math.floor((centroPx.x - tamanho.largura / 2) / TAMANHO_TILE);
    const fimX = Math.floor((centroPx.x + tamanho.largura / 2) / TAMANHO_TILE);
    const inicioY = Math.max(0, Math.floor((centroPx.y - tamanho.altura / 2) / TAMANHO_TILE));
    const fimY = Math.min(2 ** zoom - 1, Math.floor((centroPx.y + tamanho.altura / 2) / TAMANHO_TILE));
    for (let y = inicioY; y <= fimY; y++) {
      for (let x = inicioX; x <= fimX; x++) {
        tiles.push({
          x: ((x % (2 ** zoom)) + 2 ** zoom) % (2 ** zoom),
          y,
          esquerda: x * TAMANHO_TILE - centroPx.x + tamanho.largura / 2,
          topo: y * TAMANHO_TILE - centroPx.y + tamanho.altura / 2,
        });
      }
    }
  }

  const marcador = ponto ? projetar(ponto, zoom) : null;
  const deslocamentoX = marcador
    ? ((marcador.x - centroPx.x + mundo / 2) % mundo + mundo) % mundo - mundo / 2
    : 0;

  function pixelDoEvento(event: PointerEvent<HTMLDivElement>): Pixel {
    const limites = event.currentTarget.getBoundingClientRect();
    return {
      x: centroPx.x + event.clientX - limites.left - limites.width / 2,
      y: centroPx.y + event.clientY - limites.top - limites.height / 2,
    };
  }

  function iniciarGesto(event: PointerEvent<HTMLDivElement>) {
    if (desabilitado || event.button !== 0) return;
    const noMarcador = event.target instanceof Element &&
      event.target.closest("[data-marcador]") !== null;
    gestoRef.current = {
      tipo: noMarcador ? "marcador" : "mapa",
      x: event.clientX,
      y: event.clientY,
      centro: centroPx,
      moveu: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moverGesto(event: PointerEvent<HTMLDivElement>) {
    const gesto = gestoRef.current;
    if (!gesto || desabilitado) return;
    const deltaX = event.clientX - gesto.x;
    const deltaY = event.clientY - gesto.y;
    if (Math.hypot(deltaX, deltaY) > 4) gesto.moveu = true;
    if (gesto.tipo === "marcador") {
      onChange(desprojetar(pixelDoEvento(event), zoom));
    } else if (gesto.moveu) {
      setCentro(desprojetar({
        x: gesto.centro.x - deltaX,
        y: gesto.centro.y - deltaY,
      }, zoom));
    }
  }

  function cancelarGesto(event: PointerEvent<HTMLDivElement>) {
    gestoRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function terminarGesto(event: PointerEvent<HTMLDivElement>) {
    const gesto = gestoRef.current;
    gestoRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (gesto && !gesto.moveu && gesto.tipo === "mapa" && !desabilitado) {
      onChange(desprojetar(pixelDoEvento(event), zoom));
    }
  }

  return (
    <div className="w-full min-w-0">
      <div
        ref={mapaRef}
        role="application"
        aria-label="Mapa para selecionar o ponto da ocorrência"
        className="relative h-[260px] w-full overflow-hidden rounded-[12px] bg-[#eaf0f7] sm:h-[300px]"
        style={{ touchAction: "none", cursor: desabilitado ? "default" : "crosshair" }}
        onPointerDown={iniciarGesto}
        onPointerMove={moverGesto}
        onPointerUp={terminarGesto}
        onPointerCancel={cancelarGesto}
      >
        {tiles.map(tile => (
          <img
            key={tile.x + ":" + tile.y + ":" + zoom}
            src={"https://tile.openstreetmap.org/" + zoom + "/" + tile.x + "/" + tile.y + ".png"}
            alt=""
            aria-hidden="true"
            draggable={false}
            onError={() => setErroTiles(true)}
            className="absolute max-w-none select-none"
            style={{ width: TAMANHO_TILE, height: TAMANHO_TILE, left: tile.esquerda, top: tile.topo }}
          />
        ))}
        {marcador && Math.abs(deslocamentoX) <= tamanho.largura / 2 + 16 && (
          <div
            data-marcador
            role="img"
            aria-label="Ponto selecionado. Arraste para ajustar."
            className="absolute z-[1] size-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-white bg-[#075ce5] shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            style={{
              left: tamanho.largura / 2 + deslocamentoX,
              top: tamanho.altura / 2 + marcador.y - centroPx.y,
              cursor: desabilitado ? "default" : "grab",
            }}
          />
        )}
        <div className="absolute right-[8px] top-[8px] z-[2] flex flex-col gap-[4px]">
          <button type="button" aria-label="Aproximar mapa" disabled={desabilitado || zoom >= 19}
            onPointerDown={event => event.stopPropagation()}
            onClick={() => { setZoom(atual => Math.min(19, atual + 1)); setErroTiles(false); }}
            className="size-[36px] rounded-[8px] bg-white text-[#10284a] text-[22px] shadow cursor-pointer disabled:opacity-50">+</button>
          <button type="button" aria-label="Afastar mapa" disabled={desabilitado || zoom <= 3}
            onPointerDown={event => event.stopPropagation()}
            onClick={() => { setZoom(atual => Math.max(3, atual - 1)); setErroTiles(false); }}
            className="size-[36px] rounded-[8px] bg-white text-[#10284a] text-[22px] shadow cursor-pointer disabled:opacity-50">−</button>
        </div>
        <div className="absolute bottom-[4px] right-[4px] z-[2] rounded bg-white/90 px-[5px] text-[10px] text-[#10284a]">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer"
            onPointerDown={event => event.stopPropagation()}
            className="underline">OpenStreetMap</a> contributors
        </div>
      </div>
      {erroTiles && (
        <p role="alert" className="mt-[6px] text-[#586a80] text-[12px]">
          Parte do mapa não carregou. Confira o ponto antes de registrar.
        </p>
      )}
    </div>
  );
}