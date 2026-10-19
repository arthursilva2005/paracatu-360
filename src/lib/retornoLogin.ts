import { ehUuidOcorrencia } from "@/lib/ocorrencias";

const RETORNO_GOOGLE_KEY = "paracatu360:retorno-google";
const rotasProtegidas = new Set(["/ocorrencias/nova", "/atividade", "/perfil", "/moderacao"]);

export function destinoLoginSeguro(from: unknown): string | null {
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(from)) return null;

  const pathname = from.split(/[?#]/, 1)[0];
  const detalhe = pathname.match(/^\/ocorrencias\/([^/]+)$/);
  const detalheModeracao = pathname.match(/^\/moderacao\/([^/]+)$/);

  return pathname === "/" || rotasProtegidas.has(pathname) ||
    (detalhe && ehUuidOcorrencia(detalhe[1])) ||
    (detalheModeracao && ehUuidOcorrencia(detalheModeracao[1])) ? from : null;
}

export function origemDoLogin(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("from" in state)) return null;
  return destinoLoginSeguro((state as { from?: unknown }).from);
}

export function guardarRetornoGoogle(from: unknown): void {
  try {
    const destino = destinoLoginSeguro(from);
    if (destino) window.sessionStorage.setItem(RETORNO_GOOGLE_KEY, destino);
    else window.sessionStorage.removeItem(RETORNO_GOOGLE_KEY);
  } catch {
    // Sem sessionStorage, o retorno seguro continua sendo a Home.
  }
}

export function limparRetornoGoogle(): void {
  try {
    window.sessionStorage.removeItem(RETORNO_GOOGLE_KEY);
  } catch {
    // O armazenamento pode estar indisponível no navegador.
  }
}

export function consumirRetornoGoogle(): string | null {
  try {
    const destino = window.sessionStorage.getItem(RETORNO_GOOGLE_KEY);
    window.sessionStorage.removeItem(RETORNO_GOOGLE_KEY);
    return destinoLoginSeguro(destino);
  } catch {
    return null;
  }
}
