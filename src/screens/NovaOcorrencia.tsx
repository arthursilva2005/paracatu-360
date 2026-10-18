import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useBlocker } from "react-router";
import svgPaths from "@/assets/svg-4r6l0jr5e2";
import { EstadoCategorias, resolverCategoria } from "@/hooks/useCategorias";
import type { DadosCriacaoOcorrencia } from "@/lib/ocorrencias";
import {
  MAX_FOTOS,
  RegistroIncompletoError,
  chaveArquivoFoto,
  erroArquivoFoto,
  validarFotos,
} from "@/lib/fotosOcorrencias";
import Cabecalho from "@/components/Cabecalho";
import SeletorLocalizacao, { type PontoLocalizacao } from "@/components/SeletorLocalizacao";
import Navegacao, { TabName } from "@/components/Navegacao";

type Props = EstadoCategorias & {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
  onRegistrar: (
    nova: DadosCriacaoOcorrencia,
    fotos: readonly File[],
    onEnviandoFotos: () => void,
  ) => Promise<string>;
  onOpenDetalhe: (id: string) => void;
  onVoltarInicio: () => void;
};

type FotoSelecionada = {
  arquivo: File;
  chave: string;
  previewUrl: string;
};

function MapPin() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 20 20">
        <path d={svgPaths.p337915b0} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
      <g clipPath="url(#clip-edit2)">
        <path d={svgPaths.p29f8df00} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs><clipPath id="clip-edit2"><rect fill="white" height="16" width="16" /></clipPath></defs>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p37770280} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path d={svgPaths.p2c44b300} stroke="#075CE5" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function Sucesso({ titulo, categoria, onVerOcorrencia, onMinhasOcorrencias, onVoltarInicio }: {
  titulo: string; categoria: string; onVerOcorrencia: () => void;
  onMinhasOcorrencias: () => void; onVoltarInicio: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-[28px] py-[24px] gap-[24px] text-center">
      <div className="w-[80px] h-[80px] rounded-full bg-[#e8f5e9] flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="#22c55e" opacity="0.15"/>
          <path d="M12 20l6 6 10-12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col gap-[8px] w-full min-w-0 [overflow-wrap:anywhere]">
        <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[22px]">Ocorrência registrada com sucesso.</h1>
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[14px] leading-relaxed">
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] break-words">"{titulo}"</span> foi enviada como{" "}
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5]">{categoria}</span>.
          <br/>Você pode acompanhar seus registros em Minhas ocorrências.
        </p>
      </div>
      <div className="flex flex-col gap-[10px] w-full">
        <button
          type="button"
          onClick={onVerOcorrencia}
          className="bg-[#075ce5] hover:bg-[#0a47b8] active:scale-[0.98] w-full rounded-[16px] py-[15px] cursor-pointer border-none outline-none transition-all"
        >
          <span className="font-['Inter:Bold',sans-serif] font-bold text-white text-[15px]">Ver ocorrência</span>
        </button>
        <button
          type="button"
          onClick={onMinhasOcorrencias}
          className="bg-white w-full rounded-[16px] py-[15px] cursor-pointer border border-[#d7e3f0] outline-none active:opacity-80 transition-all"
        >
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Minhas ocorrências</span>
        </button>
        <button
          type="button"
          onClick={onVoltarInicio}
          className="bg-white w-full rounded-[16px] py-[15px] cursor-pointer border border-[#d7e3f0] outline-none active:opacity-80 transition-all"
        >
          <span className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px]">Voltar para o início</span>
        </button>
      </div>
    </div>
  );
}

export default function NovaOcorrencia({
  activeTab,
  onNavigate,
  onRegistrar,
  onOpenDetalhe,
  onVoltarInicio,
  categorias,
  categoriasLoading,
  categoriasError,
  recarregarCategorias,
}: Props) {
  const [categoriaId, setCategoriaId] = useState("");
  const categoriaSelecionada = resolverCategoria(categoriaId, categorias);
  const categoria = categoriaSelecionada?.nome ?? "";
  const [descricao, setDescricao] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [ponto, setPonto] = useState<PontoLocalizacao | null>(null);
  const [centroGps, setCentroGps] = useState<PontoLocalizacao | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [erroGps, setErroGps] = useState("");
  const [erroPonto, setErroPonto] = useState("");
  const [erroBairro, setErroBairro] = useState("");
  const [erroEndereco, setErroEndereco] = useState("");
  const [idRegistrado, setIdRegistrado] = useState<string | null>(null);
  const sucesso = idRegistrado !== null;
  const [titulo, setTitulo] = useState("");
  const [erroTitulo, setErroTitulo] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");
  const [erroRegistro, setErroRegistro] = useState("");
  const [erroFotos, setErroFotos] = useState("");
  const [fotosSelecionadas, setFotosSelecionadas] = useState<FotoSelecionada[]>([]);
  const [faseRegistro, setFaseRegistro] = useState<"idle" | "registrando" | "enviando">("idle");
  const [registroIncompleto, setRegistroIncompleto] = useState(false);
  const [tituloRegistrado, setTituloRegistrado] = useState("");
  const fotosRef = useRef<FotoSelecionada[]>([]);
  const envioEmAndamento = useRef(false);
  const localizandoRef = useRef(false);
  const pedidoGpsRef = useRef(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const categoriaRef = useRef<HTMLSelectElement>(null);
  const pontoRef = useRef<HTMLHeadingElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);
  const tituloRef = useRef<HTMLInputElement>(null);
  const fotoBotaoRef = useRef<HTMLButtonElement>(null);
  const avisoSaidaRef = useRef<HTMLDialogElement>(null);
  const focoAntesDoAvisoRef = useRef<HTMLElement | null>(null);
  const registrando = faseRegistro !== "idle";
  const formularioAlterado = !sucesso && Boolean(
    categoriaId || ponto || bairro.trim() || endereco.trim() || titulo.trim() ||
    descricao.trim() || fotosSelecionadas.length,
  );
  const bloqueioSaida = useBlocker(({ currentLocation, nextLocation }) =>
    formularioAlterado && (currentLocation.pathname !== nextLocation.pathname ||
      currentLocation.search !== nextLocation.search || currentLocation.hash !== nextLocation.hash),
  );

  useEffect(() => {
    const aviso = avisoSaidaRef.current;
    if (!aviso) return;
    if (bloqueioSaida.state !== "blocked") {
      if (aviso.open) aviso.close();
      return;
    }
    focoAntesDoAvisoRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    if (!aviso.open) aviso.showModal();
    const rolante = aviso.closest(".app-screen")?.querySelector<HTMLElement>(".screen-scroll");
    const overflowAnterior = rolante?.style.overflowY;
    if (rolante) rolante.style.overflowY = "hidden";
    return () => {
      if (rolante) rolante.style.overflowY = overflowAnterior ?? "";
    };
  }, [bloqueioSaida.state]);

  function continuarPreenchendo() {
    if (bloqueioSaida.state !== "blocked") return;
    avisoSaidaRef.current?.close();
    bloqueioSaida.reset();
    focoAntesDoAvisoRef.current?.focus();
  }

  useEffect(() => {
    if (!formularioAlterado) return;
    const avisarSaida = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", avisarSaida);
    return () => window.removeEventListener("beforeunload", avisarSaida);
  }, [formularioAlterado]);

  useEffect(() => () => {
    pedidoGpsRef.current += 1;
    fotosRef.current.forEach(foto => URL.revokeObjectURL(foto.previewUrl));
    fotosRef.current = [];
  }, []);

  useEffect(() => {
    setCategoriaId(categoriaAtual => {
      if (!categoriaAtual || categorias.some(cat => cat.id === categoriaAtual)) return categoriaAtual;
      return "";
    });
  }, [categorias]);

  function usarMinhaLocalizacao() {
    if (localizandoRef.current || registrando || registroIncompleto) return;
    if (!navigator.geolocation) {
      setErroGps("Seu navegador não oferece localização. Escolha o ponto manualmente no mapa.");
      return;
    }

    const pedido = ++pedidoGpsRef.current;
    localizandoRef.current = true;
    setLocalizando(true);
    setErroGps("");

    try {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (pedido !== pedidoGpsRef.current) return;
          localizandoRef.current = false;
          setLocalizando(false);
          const { latitude, longitude } = position.coords;
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            setErroGps("Não foi possível obter sua localização. Escolha o ponto manualmente no mapa.");
            return;
          }
          const novoPonto = { latitude, longitude };
          setPonto(novoPonto);
          setCentroGps(novoPonto);
          setErroPonto("");
        },
        error => {
          if (pedido !== pedidoGpsRef.current) return;
          localizandoRef.current = false;
          setLocalizando(false);
          const mensagem = error.code === 1
            ? "A localização foi negada. Escolha o ponto manualmente no mapa."
            : error.code === 3
              ? "A localização demorou demais. Tente novamente ou escolha o ponto no mapa."
              : "Não foi possível acessar sua localização. Escolha o ponto manualmente no mapa.";
          setErroGps(mensagem);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } catch {
      localizandoRef.current = false;
      setLocalizando(false);
      setErroGps("Não foi possível acessar sua localização. Escolha o ponto manualmente no mapa.");
    }
  }

  function adicionarFotos(event: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (registrando || registroIncompleto || arquivos.length === 0) return;

    const selecionadas = [...fotosRef.current];
    const chaves = new Set(selecionadas.map(foto => foto.chave));
    let aviso = "";

    for (const arquivo of arquivos) {
      if (selecionadas.length >= MAX_FOTOS) {
        aviso = "Você pode adicionar no máximo 3 fotos. Remova uma para escolher outra.";
        break;
      }

      const erro = erroArquivoFoto(arquivo);
      const chave = chaveArquivoFoto(arquivo);
      if (erro || chaves.has(chave)) {
        aviso = erro ?? "Esta foto já foi selecionada.";
        continue;
      }

      selecionadas.push({
        arquivo,
        chave,
        previewUrl: URL.createObjectURL(arquivo),
      });
      chaves.add(chave);
    }

    fotosRef.current = selecionadas;
    setFotosSelecionadas(selecionadas);
    setErroFotos(aviso);
  }

  function removerFoto(chave: string) {
    if (registrando || registroIncompleto) return;
    const foto = fotosRef.current.find(item => item.chave === chave);
    if (!foto) return;
    URL.revokeObjectURL(foto.previewUrl);
    const restantes = fotosRef.current.filter(item => item.chave !== chave);
    fotosRef.current = restantes;
    setFotosSelecionadas(restantes);
    setErroFotos("");
  }

  async function handleRegistrar() {
    if (sucesso || envioEmAndamento.current || registroIncompleto || localizandoRef.current) return;
    const categoriaInvalida = !categoriaSelecionada || categoriasLoading || Boolean(categoriasError);
    const tituloValido = titulo.trim();
    const bairroInformado = bairro.trim();
    const enderecoInformado = endereco.trim();
    const tituloInvalido = tituloValido.length < 5 || tituloValido.length > 80;
    let erroFotoAtual = "";
    try {
      validarFotos(fotosSelecionadas.map(foto => foto.arquivo));
    } catch (error) {
      erroFotoAtual = fotosSelecionadas.length === 0 ? "Adicione pelo menos uma foto do problema."
        : error instanceof Error ? error.message : "Selecione de 1 a 3 fotos válidas.";
    }

    setErroCategoria(categoriaInvalida ? "Selecione a categoria do problema." : "");
    setErroPonto(ponto ? "" : "Marque o local do problema no mapa.");
    setErroBairro(bairroInformado ? "" : "Informe o bairro da ocorrência.");
    setErroEndereco(enderecoInformado ? "" : "Informe o endereço da ocorrência.");
    setErroTitulo(tituloInvalido ? "Digite um título com 5 a 80 caracteres." : "");
    setErroFotos(erroFotoAtual);

    const primeiroInvalido = categoriaInvalida ? categoriaRef.current
      : !ponto ? pontoRef.current
      : !bairroInformado ? bairroRef.current
      : !enderecoInformado ? enderecoRef.current
      : tituloInvalido ? tituloRef.current
      : erroFotoAtual ? fotoBotaoRef.current : null;
    if (categoriaInvalida || !ponto || !bairroInformado || !enderecoInformado || tituloInvalido || erroFotoAtual) {
      if (primeiroInvalido) {
        requestAnimationFrame(() => {
          primeiroInvalido.focus({ preventScroll: true });
          const campo = primeiroInvalido.getBoundingClientRect();
          const visor = primeiroInvalido.closest(".screen-scroll")?.getBoundingClientRect();
          if (campo.top < (visor?.top ?? 0) || campo.bottom > (visor?.bottom ?? window.innerHeight)) {
            primeiroInvalido.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "center",
            });
          }
        });
      }
      return;
    }
    setErroRegistro("");
    pedidoGpsRef.current += 1;
    envioEmAndamento.current = true;
    setFaseRegistro("registrando");

    try {
      const id = await onRegistrar({
        categoriaId,
        titulo: tituloValido,
        descricao: descricao || "Sem descrição.",
        endereco: enderecoInformado,
        bairro: bairroInformado,
        latitude: ponto.latitude,
        longitude: ponto.longitude,
      }, fotosSelecionadas.map(foto => foto.arquivo), () => setFaseRegistro("enviando"));
      fotosRef.current.forEach(foto => URL.revokeObjectURL(foto.previewUrl));
      fotosRef.current = [];
      setFotosSelecionadas([]);
      setTituloRegistrado(tituloValido);
      setIdRegistrado(id);
    } catch (error) {
      console.error("Não foi possível registrar a ocorrência.", error);
      if (error instanceof RegistroIncompletoError) {
        setRegistroIncompleto(true);
        setErroRegistro("O registro não foi concluído e pode ter ficado pendente. Não tente enviá-lo novamente; entre em contato com o suporte.");
      } else {
        setErroRegistro("Não foi possível registrar a ocorrência. Tente novamente.");
      }
    } finally {
      envioEmAndamento.current = false;
      setFaseRegistro("idle");
    }
  }

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full" data-name="02 · Nova ocorrência">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full flex flex-col">
        {sucesso ? (
          <Sucesso
            titulo={tituloRegistrado}
            categoria={categoria}
            onVerOcorrencia={() => onOpenDetalhe(idRegistrado!)}
            onMinhasOcorrencias={() => onNavigate("perfil")}
            onVoltarInicio={onVoltarInicio}
          />
        ) : (
          <div className="screen-content layout-novaocorrencia content-stretch flex flex-col gap-[20px] items-start p-[22px] relative w-full">

            {/* Introdução */}
            <div className="new-intro [word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[1.45] not-italic relative shrink-0 w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[24px] w-full">Nova ocorrência</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[14px] w-full">Descreva o problema, adicione fotos e escolha o local para abrir o registro.</p>
              <p className="text-[#586a80] text-[12px] w-full">Campos com * são obrigatórios.</p>
            </div>

            <div className="new-report-fields">
            {/* Categoria */}
            <div className="new-category content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <label htmlFor="nova-categoria" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Categoria do problema *</label>
              <select
                id="nova-categoria"
                ref={categoriaRef}
                value={categoriaId}
                onChange={event => { setCategoriaId(event.target.value); setErroCategoria(""); }}
                disabled={categoriasLoading || Boolean(categoriasError) || registrando || registroIncompleto}
                required
                aria-invalid={!!erroCategoria}
                aria-describedby={erroCategoria ? "erro-categoria" : undefined}
                className="w-full min-w-0 rounded-[12px] border border-[#d7e3f0] bg-white px-[12px] py-[11px] text-[#10284a] text-[13px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075ce5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
              {categoriasLoading && (
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">Carregando categorias...</p>
              )}
              {!categoriasLoading && categoriasError && (
                <div className="flex flex-wrap items-center gap-[8px]">
                  <p role="alert" className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">{categoriasError}</p>
                  <button type="button" onClick={recarregarCategorias}
                    className="rounded-[10px] border border-[#075ce5] bg-white px-[12px] py-[8px] text-[#075ce5] text-[12px] font-semibold cursor-pointer">
                    Tentar novamente
                  </button>
                </div>
              )}
              {!categoriasLoading && !categoriasError && categorias.length === 0 && (
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">Nenhuma categoria disponível no momento.</p>
              )}
              {erroCategoria && (
                <p id="erro-categoria" role="alert" className="font-['Inter:Regular',sans-serif] font-normal text-[#dc2626] text-[12px]">{erroCategoria}</p>
              )}
            </div>

            {/* Descrição — textarea real */}
            <div className="new-description content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <label htmlFor="titulo-ocorrencia" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[14px]">Título do problema *</label>
              <input
                id="titulo-ocorrencia"
                ref={tituloRef}
                value={titulo}
                disabled={registrando || registroIncompleto}
                onChange={e => { setTitulo(e.target.value.slice(0, 80)); setErroTitulo(""); }}
                required
                minLength={5}
                maxLength={80}
                aria-invalid={!!erroTitulo}
                aria-describedby={erroTitulo ? "erro-titulo" : undefined}
                placeholder="Resuma o problema em um título"
                className="bg-white w-full min-w-0 rounded-[16px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce]"
              />
              {erroTitulo && <p id="erro-titulo" role="alert" className="font-['Inter:Regular',sans-serif] text-[#dc2626] text-[12px]">{erroTitulo}</p>}

              <div className="flex items-center justify-between w-full">
                <label htmlFor="descricao-ocorrencia" className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px]">Descrição do problema (opcional)</label>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[11px]" aria-live="off">{descricao.length}/300</p>
              </div>
              <textarea
                id="descricao-ocorrencia"
                value={descricao}
                disabled={registrando || registroIncompleto}
                onChange={e => setDescricao(e.target.value.slice(0, 300))}
                maxLength={300}
                placeholder="Descreva o que está acontecendo, onde exatamente o problema está e qualquer detalhe importante..."
                className="bg-white w-full h-[130px] rounded-[16px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] resize-none leading-relaxed"
              />
            </div>

            {/* Fotos */}
            <div className="new-photos content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <h2 id="fotos-titulo" className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full">Adicione fotos do problema *</h2>
              <p id="fotos-ajuda" className="text-[#586a80] text-[12px]">Adicione pelo menos 1 foto. Você pode enviar até 3.</p>
              <input
                ref={cameraRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="sr-only"
                disabled={registrando || registroIncompleto}
                onChange={adicionarFotos}
                aria-label="Tirar foto"
              />
              <input
                ref={galeriaRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={registrando || registroIncompleto}
                onChange={adicionarFotos}
                aria-label="Selecionar fotos da galeria"
              />
              <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
                <button ref={fotoBotaoRef} type="button" disabled={registrando || registroIncompleto} onClick={() => cameraRef.current?.click()}
                  aria-invalid={!!erroFotos} aria-describedby={erroFotos ? "fotos-ajuda erro-fotos" : "fotos-ajuda"}
                  className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] photo-option shrink-0 size-[96px] cursor-pointer active:opacity-80 gap-[4px] border border-dashed border-[#d7e3f0] disabled:cursor-not-allowed disabled:opacity-60">
                  <CameraIcon />
                  <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#586a80] text-[11px]">Câmera</span>
                </button>
                <button type="button" disabled={registrando || registroIncompleto} onClick={() => galeriaRef.current?.click()}
                  aria-invalid={!!erroFotos} aria-describedby={erroFotos ? "fotos-ajuda erro-fotos" : "fotos-ajuda"}
                  className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[16px] photo-option shrink-0 size-[96px] cursor-pointer active:opacity-80 gap-[4px] border border-dashed border-[#d7e3f0] disabled:cursor-not-allowed disabled:opacity-60">
                  <ImageIcon />
                  <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#586a80] text-[11px]">Galeria</span>
                </button>
              </div>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">
                {fotosSelecionadas.length}/{MAX_FOTOS} fotos · JPEG, PNG ou WebP · até 5 MiB cada
              </p>
              {fotosSelecionadas.length > 0 && (
                <div className="flex flex-wrap gap-[8px] w-full">
                  {fotosSelecionadas.map((foto, indice) => (
                    <div key={foto.chave} className="relative size-[80px] shrink-0">
                      <img src={foto.previewUrl} alt={"Foto selecionada " + (indice + 1)}
                        className="size-full rounded-[12px] object-cover border border-[#d7e3f0]" />
                      <button type="button" onClick={() => removerFoto(foto.chave)}
                        disabled={registrando || registroIncompleto}
                        aria-label={"Remover foto " + (indice + 1)}
                        className="absolute right-0 top-0 size-[28px] rounded-full bg-[#10284a] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {erroFotos && <p id="erro-fotos" role="alert" className="font-['Inter:Regular',sans-serif] font-normal text-[#dc2626] text-[12px]">{erroFotos}</p>}
            </div>

            {/* Registrar */}
            <div className="new-submit content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full pb-[8px]">
              <button
                onClick={handleRegistrar}
                disabled={categoriasLoading || Boolean(categoriasError) || localizando || registrando || registroIncompleto}
                className="bg-[#ffcc36] hover:bg-[#f0bb20] active:scale-[0.98] w-full rounded-[16px] py-[15px] cursor-pointer border-none outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[15px] text-center">
                  {faseRegistro === "registrando" ? "Registrando..." : faseRegistro === "enviando" ? "Enviando fotos..." : "Registrar ocorrência"}
                </p>
              </button>
              {erroRegistro && (
                <p role="alert" className="font-['Inter:Regular',sans-serif] font-normal text-[#dc2626] text-[12px] text-center w-full">
                  {erroRegistro}
                </p>
              )}
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px] text-center w-full">
                Após registrar, encontre seu relato em Minhas ocorrências.
              </p>
            </div>

            </div>

            <div className="new-location-column">
              {/* Localização real: GPS opcional, ponto obrigatório e endereço manual. */}
              <div className="new-location content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <h2 ref={pontoRef} tabIndex={-1} aria-describedby={erroPonto ? "local-ajuda erro-ponto" : "local-ajuda"}
                  className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[1.45] not-italic relative shrink-0 text-[#10284a] text-[14px] w-full focus:outline-2 focus:outline-offset-2 focus:outline-[#075ce5]">Local do problema *</h2>
                <p id="local-ajuda" className="text-[#586a80] text-[12px]">Use sua localização ou toque no mapa para marcar o local.</p>
                {erroPonto && <p id="erro-ponto" role="alert" className="text-[#dc2626] text-[12px] w-full">{erroPonto}</p>}
                <div className="bg-white content-stretch flex flex-col gap-[14px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full border border-[#d7e3f0]">
                  <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                    <div className="bg-[#f3f6fa] content-stretch flex flex-col items-center justify-center relative rounded-[12px] shrink-0 size-[40px]">
                      <MapPin />
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[1.45] min-w-px not-italic relative">
                      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#10284a] text-[14px] w-full">
                        {ponto ? "Ponto selecionado no mapa" : "Nenhum ponto selecionado"}
                      </p>
                      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#586a80] text-[12px] w-full">
                        {ponto ? [ponto.latitude.toFixed(6), ponto.longitude.toFixed(6)].join(", ") : "Use o GPS ou escolha o local no mapa"}
                      </p>
                    </div>
                  </div>

                  <button type="button" onClick={usarMinhaLocalizacao}
                    disabled={localizando || registrando || registroIncompleto}
                    className="bg-[#f3f6fa] rounded-[12px] px-[14px] py-[11px] w-full text-left text-[#075ce5] text-[13px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                    {localizando ? "Localizando..." : "Usar minha localização"}
                  </button>
                  {erroGps && <p role="alert" className="text-[#dc2626] text-[12px] w-full">{erroGps}</p>}

                  <SeletorLocalizacao
                    ponto={ponto}
                    centralizarEm={centroGps}
                    desabilitado={registrando || registroIncompleto || localizando}
                    onChange={novoPonto => { setPonto(novoPonto); setErroPonto(""); setErroGps(""); }}
                  />
                  <div className="flex items-center gap-[8px] text-[#586a80] text-[12px] w-full">
                    <EditIcon />
                    <p>Toque no mapa ou arraste o ponto para ajustar o local.</p>
                  </div>
                  <div className="flex flex-col gap-[6px] w-full">
                    <label htmlFor="bairro-ocorrencia" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Bairro *</label>
                    <input id="bairro-ocorrencia" ref={bairroRef} type="text" value={bairro} required
                      disabled={registrando || registroIncompleto}
                      onChange={event => { setBairro(event.target.value); setErroBairro(""); }}
                      aria-invalid={!!erroBairro}
                      aria-describedby={erroBairro ? "erro-bairro" : undefined}
                      placeholder="Informe o bairro"
                      className="bg-white w-full min-w-0 rounded-[12px] px-[14px] py-[12px] border border-[#d7e3f0] text-[#10284a] text-[14px] outline-none focus:border-[#075ce5]" />
                    {erroBairro && <p id="erro-bairro" role="alert" className="text-[#dc2626] text-[12px]">{erroBairro}</p>}
                  </div>
                  <div className="flex flex-col gap-[6px] w-full">
                    <label htmlFor="endereco-ocorrencia" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Endereço *</label>
                    <input id="endereco-ocorrencia" ref={enderecoRef} type="text" value={endereco} required
                      disabled={registrando || registroIncompleto}
                      onChange={event => { setEndereco(event.target.value); setErroEndereco(""); }}
                      aria-invalid={!!erroEndereco}
                      aria-describedby={erroEndereco ? "erro-endereco" : undefined}
                      placeholder="Informe a rua ou referência"
                      className="bg-white w-full min-w-0 rounded-[12px] px-[14px] py-[12px] border border-[#d7e3f0] text-[#10284a] text-[14px] outline-none focus:border-[#075ce5]" />
                    {erroEndereco && <p id="erro-endereco" role="alert" className="text-[#dc2626] text-[12px]">{erroEndereco}</p>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      {!sucesso && <Navegacao activeTab={activeTab} onNavigate={onNavigate} />}
      <dialog ref={avisoSaidaRef} role="dialog" aria-modal="true" aria-labelledby="aviso-saida-titulo"
        onCancel={event => { event.preventDefault(); continuarPreenchendo(); }}
        className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-32px)] max-w-[420px] max-h-[calc(100dvh-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] border border-[#d7e3f0] bg-white p-[22px] text-[#10284a] shadow-xl backdrop:bg-[#10284a]/50">
        <h2 id="aviso-saida-titulo" className="text-[18px] font-bold">Sair do registro?</h2>
        <p className="mt-[10px] text-[14px] text-[#586a80]">Você tem informações não salvas. Deseja sair mesmo assim?</p>
        <div className="mt-[20px] flex flex-col gap-[10px] sm:flex-row-reverse">
          <button type="button" onClick={() => { if (bloqueioSaida.state === "blocked") bloqueioSaida.proceed(); }}
            className="rounded-[12px] bg-[#075ce5] px-[14px] py-[12px] text-white text-[14px] font-semibold cursor-pointer">
            Sair sem salvar
          </button>
          <button type="button" autoFocus onClick={continuarPreenchendo}
            className="rounded-[12px] border border-[#d7e3f0] bg-white px-[14px] py-[12px] text-[#10284a] text-[14px] font-semibold cursor-pointer">
            Continuar preenchendo
          </button>
        </div>
      </dialog>
    </div>
  );
}
