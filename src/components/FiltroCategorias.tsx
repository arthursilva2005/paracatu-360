import type { CategoriaOcorrencia } from "@/hooks/useCategorias";

type Props = {
  categorias: CategoriaOcorrencia[];
  selecionada: string;
  onSelecionar: (categoriaId: string) => void;
};

export default function FiltroCategorias({ categorias, selecionada, onSelecionar }: Props) {
  return (
    <div className="filter-chips" role="group" aria-label="Filtrar por categoria">
      <button type="button" className="filter-chip" aria-pressed={selecionada === ""}
        onClick={() => onSelecionar("")}>Todas</button>
      {categorias.map(categoria => (
        <button key={categoria.id} type="button" className="filter-chip"
          aria-pressed={selecionada === categoria.id}
          onClick={() => onSelecionar(categoria.id)}>{categoria.nome}</button>
      ))}
    </div>
  );
}
