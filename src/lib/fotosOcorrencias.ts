import type { FotoOcorrencia } from "@/data/ocorrencias";
import { supabase } from "@/lib/supabase";

const BUCKET = "ocorrencia-fotos";
export const MAX_FOTOS = 3;
export const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function chaveArquivoFoto(arquivo: File): string {
  return [arquivo.name, arquivo.size, arquivo.lastModified].join("|");
}

export function erroArquivoFoto(arquivo: File): string | null {
  if (!EXTENSOES[arquivo.type]) {
    return "Selecione fotos JPEG, PNG ou WebP.";
  }
  if (arquivo.size === 0 || arquivo.size > TAMANHO_MAXIMO_FOTO) {
    return "Cada foto deve ter até 5 MiB e não pode estar vazia.";
  }
  return null;
}

export function validarFotos(arquivos: readonly File[]): void {
  if (arquivos.length < 1 || arquivos.length > MAX_FOTOS) {
    throw new Error("Adicione de 1 a 3 fotos para registrar a ocorrência.");
  }

  const chaves = new Set<string>();
  for (const arquivo of arquivos) {
    const erro = erroArquivoFoto(arquivo);
    if (erro) throw new Error(erro);
    const chave = chaveArquivoFoto(arquivo);
    if (chaves.has(chave)) throw new Error("Esta foto já foi selecionada.");
    chaves.add(chave);
  }
}

type LimpezaFotos = {
  objetosRemovidos: boolean;
  metadadosRemovidos: boolean;
};

export class ErroEnvioFotos extends Error {
  constructor(readonly limpeza: LimpezaFotos) {
    super("Não foi possível salvar as fotos da ocorrência.");
  }
}

export class RegistroIncompletoError extends Error {
  constructor(readonly ocorrenciaId: string) {
    super("A ocorrência foi criada, mas a limpeza após a falha não foi concluída.");
  }
}

async function limparTentativa(
  ocorrenciaId: string,
  paths: string[],
): Promise<LimpezaFotos> {
  let metadadosRemovidos = true;
  let objetosRemovidos = true;

  try {
    const { error } = await supabase
      .from("ocorrencia_fotos")
      .delete()
      .eq("ocorrencia_id", ocorrenciaId);
    if (error) metadadosRemovidos = false;
  } catch {
    metadadosRemovidos = false;
  }

  if (paths.length > 0) {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove(paths);
      if (error) objetosRemovidos = false;
    } catch {
      objetosRemovidos = false;
    }
  }

  return { objetosRemovidos, metadadosRemovidos };
}

export async function enviarFotosOcorrencia(
  ocorrenciaId: string,
  arquivos: readonly File[],
): Promise<FotoOcorrencia[]> {
  validarFotos(arquivos);

  const pathsDaTentativa: string[] = [];
  const fotos: FotoOcorrencia[] = [];

  try {
    for (const [indice, arquivo] of arquivos.entries()) {
      const extensao = EXTENSOES[arquivo.type];
      const storagePath = "ocorrencias/" + ocorrenciaId + "/" + crypto.randomUUID() + "." + extensao;
      // Inclui também o upload cuja resposta pode ter se perdido na rede.
      pathsDaTentativa.push(storagePath);

      const { error: erroUpload } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, arquivo, {
          contentType: arquivo.type,
          upsert: false,
        });
      if (erroUpload) throw erroUpload;

      const ordem = indice + 1;
      const { data, error: erroMetadados } = await supabase
        .from("ocorrencia_fotos")
        .insert({
          ocorrencia_id: ocorrenciaId,
          storage_path: storagePath,
          ordem,
        })
        .select("id, storage_path, ordem")
        .single<{ id: string; storage_path: string; ordem: number }>();

      if (erroMetadados || !data?.id || data.storage_path !== storagePath || data.ordem !== ordem) {
        throw erroMetadados ?? new Error("Metadados da foto não retornados pelo banco.");
      }

      fotos.push({ id: data.id, storagePath: data.storage_path, ordem: data.ordem });
    }

    return fotos;
  } catch (error) {
    console.error("Falha ao persistir fotos da ocorrência.", error);
    throw new ErroEnvioFotos(await limparTentativa(ocorrenciaId, pathsDaTentativa));
  }
}
