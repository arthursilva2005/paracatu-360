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

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErro("");

    try {
      const { error } = await signIn(email.trim(), senha);
      if (error) setErro(mensagemErroLogin(error));
    } catch (error) {
      console.error("Falha inesperada durante o login.", error);
      setErro("Não foi possível entrar agora. Tente novamente.");
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
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[24px]">Bem-vindo!</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[14px]">Entre para acompanhar e registrar ocorrências na sua cidade.</p>
        </div>

        <div className="flex flex-col gap-[12px]">
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
              autoComplete="current-password"
              required
              disabled={submitting}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full disabled:opacity-70"
            />
          </div>

          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[13px] text-right cursor-pointer">Esqueci minha senha</p>
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
            {submitting ? "Entrando..." : "Entrar"}
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
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[13px]">Não tem conta?</p>
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[13px] cursor-pointer">Criar conta gratuita</p>
        </div>
      </form>

      {/* Rodapé */}
      <div className="w-full px-[28px] pb-[28px] pt-[8px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[10px] text-center">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
      </div>
    </div>
  );
}
