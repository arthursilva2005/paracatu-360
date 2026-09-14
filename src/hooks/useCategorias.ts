import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface CategoriaOcorrencia {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  ordem: number;
}

type CategoriaBanco = CategoriaOcorrencia;

export type EstadoCategorias = {
  categorias: CategoriaOcorrencia[];
  categoriasLoading: boolean;
  categoriasError: string | null;
};

/** Compatibilidade temporária entre códigos oficiais com "_" e slugs legados com "-". */
export function normalizarCodigoCategoria(codigo: string): string {
  return codigo.replace(/-/g, "_");
}

export function resolverCategoria(
  categoriaId: string,
  categorias: CategoriaOcorrencia[],
): CategoriaOcorrencia | undefined {
  const codigoNormalizado = normalizarCodigoCategoria(categoriaId);
  return categorias.find(categoria =>
    categoria.id === categoriaId ||
    normalizarCodigoCategoria(categoria.codigo) === codigoNormalizado
  );
}

export default function useCategorias(): EstadoCategorias {
  const [categorias, setCategorias] = useState<CategoriaOcorrencia[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [categoriasError, setCategoriasError] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("categorias")
          .select("id, nome, codigo, ativa, ordem")
          .eq("ativa", true)
          .order("ordem", { ascending: true });

        if (!ativo) return;

        if (error) {
          console.error("Não foi possível carregar as categorias.", error);
          setCategorias([]);
          setCategoriasError("Não foi possível carregar as categorias agora.");
          return;
        }

        const categoriasCarregadas = ((data ?? []) as CategoriaBanco[]).map(categoria => ({
          id: categoria.id,
          nome: categoria.nome,
          codigo: categoria.codigo,
          ativa: categoria.ativa,
          ordem: categoria.ordem,
        }));

        setCategorias(categoriasCarregadas);
        setCategoriasError(null);
      } catch (error) {
        if (!ativo) return;

        console.error("Não foi possível carregar as categorias.", error);
        setCategorias([]);
        setCategoriasError("Não foi possível carregar as categorias agora.");
      } finally {
        if (ativo) setCategoriasLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return { categorias, categoriasLoading, categoriasError };
}
