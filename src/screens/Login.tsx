import { useState, type FormEvent } from "react";
import logo from "@/assets/logoptu360.jpg";
import { useAuth } from "@/context/AuthContext";

function mensagemErroLogin(error: { message: string; status?: number } | null): string {
  if (!error) return "";

  const message = error.message.toLowerCase();
  if (message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (message.includes("invalid login credentials") || error.status === 400) {
    return "E-mail ou senha inválidos.";
  }

  return "Não foi possível entrar agora. Tente novamente.";
}

function mensagemErroCadastro(error: { message: string; status?: number } | null): string {
  if (!error) return "";

  const message = error.message.toLowerCase();
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Já existe uma conta com este e-mail.";
  }
  if (message.includes("password") && message.includes("least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (message.includes("invalid") && message.includes("email")) {
    return "Informe um e-mail válido.";
  }

  return "Não foi possível criar sua conta agora. Tente novamente.";
}

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function trocarModo(novoModo: "login" | "cadastro") {
    setModo(novoModo);
    setSenha("");
    setConfirmacaoSenha("");
    setErro("");
    setMensagem("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (modo === "cadastro" && !nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (modo === "cadastro" && senha !== confirmacaoSenha) {
      setErro("A senha e a confirmação devem ser iguais.");
      return;
    }

    setSubmitting(true);
    setErro("");
    setMensagem("");

    try {
      if (modo === "cadastro") {
        const { error, session } = await signUp(nome.trim(), email.trim(), senha);
        if (error) {
          setErro(mensagemErroCadastro(error));
          return;
        }

        if (!session) {
          setModo("login");
          setSenha("");
          setConfirmacaoSenha("");
          setMensagem("Conta criada. Confirme seu e-mail antes de entrar.");
        }
        return;
      }

      const { error } = await signIn(email.trim(), senha);
      if (error) setErro(mensagemErroLogin(error));
    } catch (error) {
      console.error(`Falha inesperada durante o ${modo}.`, error);
      setErro(modo === "login"
        ? "Não foi possível entrar agora. Tente novamente."
        : "Não foi possível criar sua conta agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-layout bg-[#f3f6fa] flex flex-col items-center justify-between size-full" data-name="Login">
      {/* Topo azul com logo */}
      <div className="bg-[#f3f6fa] w-full flex flex-col items-center justify-center pt-[56px] pb-[48px] px-[32px]">
        <img
          src={logo}
          alt="Paracatu360"
          className="w-[200px] object-contain drop-shadow-lg"
        />
        <p className="font-['Inter:Regular',sans-serif] font-normal text-white/80 text-[12px] mt-[12px] tracking-widest uppercase text-center">
          Cidade Conectada, Resultados Reais.
        </p>
      </div>

      {/* Formulário */}
      <form className="flex-1 w-full flex flex-col justify-center px-[28px] gap-[20px]" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-[6px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[24px]">
            {modo === "login" ? "Bem-vindo!" : "Crie sua conta"}
          </p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[14px]">
            {modo === "login"
              ? "Entre para acompanhar e registrar ocorrências na sua cidade."
              : "Cadastre-se para participar e acompanhar sua cidade."}
          </p>
        </div>

        <div className="flex flex-col gap-[12px]">
          {modo === "cadastro" && (
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="nome" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={event => { setNome(event.target.value); setErro(""); }}
                placeholder="Seu nome"
                autoComplete="name"
                required
                disabled={submitting}
                className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full disabled:opacity-70"
              />
            </div>
          )}

          {/* E-mail */}
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="email" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={event => { setEmail(event.target.value); setErro(""); }}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              disabled={submitting}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full disabled:opacity-70"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="senha" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={event => { setSenha(event.target.value); setErro(""); }}
              placeholder="••••••••"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              minLength={6}
              required
              disabled={submitting}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full disabled:opacity-70"
            />
          </div>

          {modo === "cadastro" && (
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="confirmacao-senha" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Confirmar senha</label>
              <input
                id="confirmacao-senha"
                type="password"
                value={confirmacaoSenha}
                onChange={event => { setConfirmacaoSenha(event.target.value); setErro(""); }}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={submitting}
                className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full disabled:opacity-70"
              />
            </div>
          )}

          {modo === "login" && (
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[13px] text-right cursor-pointer">Esqueci minha senha</p>
          )}
          {mensagem && (
            <p role="status" className="font-['Inter:Regular',sans-serif] font-normal text-[#18794e] text-[13px] text-center">
              {mensagem}
            </p>
          )}
          {erro && (
            <p role="alert" className="font-['Inter:Regular',sans-serif] font-normal text-[#dc2626] text-[13px] text-center">
              {erro}
            </p>
          )}
        </div>

        {/* Botão entrar */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#075ce5] hover:bg-[#0a47b8] active:bg-[#083a96] active:scale-[0.98] w-full rounded-[16px] py-[16px] cursor-pointer border-none outline-none transition-all duration-150 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
        >
          <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[16px] text-center">
            {submitting
              ? (modo === "login" ? "Entrando..." : "Criando conta...")
              : (modo === "login" ? "Entrar" : "Criar conta")}
          </p>
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-[12px]">
          <div className="flex-1 h-px bg-[#d7e3f0]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[12px]">ou</p>
          <div className="flex-1 h-px bg-[#d7e3f0]" />
        </div>

        {/* Cadastro */}
        <div className="flex flex-col items-center gap-[4px]">
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">
            {modo === "login" ? "Não tem conta?" : "Já tem uma conta?"}
          </p>
          <button
            type="button"
            disabled={submitting}
            onClick={() => trocarModo(modo === "login" ? "cadastro" : "login")}
            className="bg-transparent border-none p-0 font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[13px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            {modo === "login" ? "Criar conta gratuita" : "Voltar para entrar"}
          </button>
        </div>
      </form>

      {/* Rodapé */}
      <div className="w-full px-[28px] pb-[28px] pt-[8px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[10px] text-center">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
      </div>
    </div>
  );
}
