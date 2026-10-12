import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import logo from "@/assets/logoptu360.jpg";
import { supabase } from "@/lib/supabase";

const mensagemNeutra = "Se existir uma conta com este e-mail, enviaremos as instruções para redefinir sua senha.";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const envioEmCurso = useRef(false);

  async function enviarLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (envioEmCurso.current || concluido) return;

    const emailLimpo = email.trim();
    if (!emailLimpo) {
      setErro("Informe seu e-mail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    envioEmCurso.current = true;
    setEnviando(true);
    setErro("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) {
        setErro(error.status === 429 || /rate limit|too many requests/i.test(error.message)
          ? "Muitas tentativas. Aguarde um pouco antes de solicitar novamente."
          : "Não foi possível enviar o link agora. Tente novamente mais tarde.");
        return;
      }
      setConcluido(true);
    } catch {
      setErro("Não foi possível enviar o link agora. Verifique sua conexão e tente novamente.");
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <div className="login-layout bg-[#f3f6fa] flex flex-col items-center justify-between size-full">
      <div className="bg-[#f3f6fa] w-full flex flex-col items-center justify-center pt-[56px] pb-[48px] px-[32px]">
        <img src={logo} alt="Paracatu360" className="w-[200px] object-contain drop-shadow-lg" />
      </div>
      <form className="flex-1 w-full flex flex-col justify-center px-[28px] gap-[20px]" onSubmit={enviarLink} noValidate>
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[24px]">Recuperar senha</h1>
          <p className="font-['Inter:Regular',sans-serif] text-[#586a80] text-[14px]">
            Informe seu e-mail para receber um link de recuperação.
          </p>
        </div>
        {!concluido && <>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="email-recuperacao" className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">E-mail</label>
            <input id="email-recuperacao" type="email" value={email}
              onChange={event => { setEmail(event.target.value); setErro(""); }}
              placeholder="seu@email.com" autoComplete="email" required disabled={enviando}
              aria-invalid={Boolean(erro)} aria-describedby={erro ? "erro-recuperacao" : undefined}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] w-full disabled:opacity-70" />
          </div>
          {erro && <p id="erro-recuperacao" role="alert" className="text-[#dc2626] text-[13px]">{erro}</p>}
          <button type="submit" disabled={enviando}
            className="bg-[#075ce5] hover:bg-[#0a47b8] w-full rounded-[16px] py-[16px] text-white font-bold text-[15px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70">
            {enviando ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </>}
        {concluido && <p role="status" className="text-[#18794e] text-[14px]">{mensagemNeutra}</p>}
        <Link to="/entrar" className="text-[#075ce5] text-[13px] font-semibold text-center">Voltar para entrar</Link>
      </form>
      <div className="w-full px-[28px] pb-[28px] pt-[8px]">
        <p className="text-[#586a80] text-[10px] text-center">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
      </div>
    </div>
  );
}
