export type PontoMapa = { latitude: number; longitude: number };
export type PixelMapa = { x: number; y: number };
export type TileMapa = { x: number; y: number; esquerda: number; topo: number };

export const TAMANHO_TILE = 256;
export const LATITUDE_MAXIMA = 85.05112878;
// Enquadramento inicial da câmera, sem representar uma ocorrência.
export const CENTRO_PARACATU: PontoMapa = { latitude: -17.224106, longitude: -46.874352 };

export function projetar(ponto: PontoMapa, zoom: number): PixelMapa {
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const latitude = Math.max(-LATITUDE_MAXIMA, Math.min(LATITUDE_MAXIMA, ponto.latitude));
  const radianos = latitude * Math.PI / 180;
  return {
    x: (ponto.longitude + 180) / 360 * mundo,
    y: (1 - Math.asinh(Math.tan(radianos)) / Math.PI) / 2 * mundo,
  };
}

export function desprojetar(pixel: PixelMapa, zoom: number): PontoMapa {
  const mundo = TAMANHO_TILE * 2 ** zoom;
  const longitude = ((pixel.x / mundo * 360) % 360 + 360) % 360 - 180;
  const y = Math.max(0, Math.min(mundo, pixel.y));
  const latitude = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / mundo))) * 180 / Math.PI;
  return { latitude, longitude };
}

export function deslocamentoHorizontal(x: number, centroX: number, mundo: number): number {
  return ((x - centroX + mundo / 2) % mundo + mundo) % mundo - mundo / 2;
}

export function calcularTiles(centro: PixelMapa, zoom: number, largura: number, altura: number): TileMapa[] {
  if (!Number.isFinite(largura) || !Number.isFinite(altura) || largura <= 0 || altura <= 0) return [];
  const tiles: TileMapa[] = [];
  const total = 2 ** zoom;
  const inicioX = Math.floor((centro.x - largura / 2) / TAMANHO_TILE);
  const fimX = Math.floor((centro.x + largura / 2) / TAMANHO_TILE);
  const inicioY = Math.max(0, Math.floor((centro.y - altura / 2) / TAMANHO_TILE));
  const fimY = Math.min(total - 1, Math.floor((centro.y + altura / 2) / TAMANHO_TILE));
  for (let y = inicioY; y <= fimY; y++) {
    for (let x = inicioX; x <= fimX; x++) {
      tiles.push({
        x: ((x % total) + total) % total,
        y,
        esquerda: x * TAMANHO_TILE - centro.x + largura / 2,
        topo: y * TAMANHO_TILE - centro.y + altura / 2,
      });
    }
  }
  return tiles;
}
