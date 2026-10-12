import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import logo from "@/assets/logoptu360.jpg";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenha() {
  const { session, loading, passwordRecovery, concluirRecuperacaoSenha } = useAuth();
  const location = useLocation();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const envioEmCurso = useRef(false);

  async function alterarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (envioEmCurso.current || concluido || !session || !passwordRecovery) return;

    if (!senha) {
      setErro("Informe a nova senha.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!confirmacao) {
      setErro("Confirme a nova senha.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("A senha e a confirmação devem ser iguais.");
      return;
    }

    envioEmCurso.current = true;
    setEnviando(true);
    setErro("");
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        if (error.status === 401 || error.status === 403 || /expired|invalid.*token|session missing/i.test(error.message)) {
          setLinkInvalido(true);
          concluirRecuperacaoSenha();
        } else {
          setErro("Não foi possível alterar a senha agora. Tente novamente.");
        }
        return;
      }
      setConcluido(true);
      setSenha("");
      setConfirmacao("");
      concluirRecuperacaoSenha();
    } catch {
      setErro("Não foi possível alterar a senha agora. Verifique sua conexão e tente novamente.");
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  }

  const parametrosRetorno = new URLSearchParams(location.hash.slice(1));
  const erroNoLink = parametrosRetorno.has("error") || parametrosRetorno.has("error_code") ||
    new URLSearchParams(location.search).has("error_code");
  const podeRedefinir = !loading && Boolean(session && passwordRecovery) && !linkInvalido && !erroNoLink;

  return (
    <div className="login-layout bg-[#f3f6fa] flex flex-col items-center justify-between size-full">
      <div className="bg-[#f3f6fa] w-full flex flex-col items-center justify-center pt-[56px] pb-[48px] px-[32px]">
        <img src={logo} alt="Paracatu360" className="w-[200px] object-contain drop-shadow-lg" />
      </div>
      <div className="flex-1 w-full flex flex-col justify-center px-[28px] gap-[20px]">
        <div className="flex flex-col gap-[6px]">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[24px]">Redefinir senha</h1>
          <p className="text-[#586a80] text-[14px]">Escolha uma nova senha para sua conta.</p>
        </div>

        {loading && <p role="status" className="text-[#586a80] text-[14px]">Verificando link de recuperação...</p>}
        {!loading && !concluido && !podeRedefinir && <>
          <p role="alert" className="text-[#586a80] text-[14px]">Este link de recuperação é inválido ou expirou.</p>
          <Link to="/recuperar-senha" className="text-[#075ce5] text-[14px] font-semibold">Solicitar novo link</Link>
        </>}
        {concluido && <>
          <p role="status" className="text-[#18794e] text-[14px]">Senha alterada com sucesso.</p>
          <Link to="/" className="text-[#075ce5] text-[14px] font-semibold">Ir para o início</Link>
        </>}
        {podeRedefinir && !concluido && <form onSubmit={alterarSenha} noValidate className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="nova-senha" className="font-bold text-[#10284a] text-[13px]">Nova senha</label>
            <input id="nova-senha" type="password" value={senha}
              onChange={event => { setSenha(event.target.value); setErro(""); }}
              autoComplete="new-password" minLength={6} required disabled={enviando}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] w-full disabled:opacity-70" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="confirmar-nova-senha" className="font-bold text-[#10284a] text-[13px]">Confirmar nova senha</label>
            <input id="confirmar-nova-senha" type="password" value={confirmacao}
              onChange={event => { setConfirmacao(event.target.value); setErro(""); }}
              autoComplete="new-password" minLength={6} required disabled={enviando}
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] w-full disabled:opacity-70" />
          </div>
          {erro && <p role="alert" className="text-[#dc2626] text-[13px]">{erro}</p>}
          <button type="submit" disabled={enviando}
            className="bg-[#075ce5] hover:bg-[#0a47b8] w-full rounded-[16px] py-[16px] text-white font-bold text-[15px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70">
            {enviando ? "Alterando senha..." : "Alterar senha"}
          </button>
        </form>}
      </div>
      <div className="w-full px-[28px] pb-[28px] pt-[8px]">
        <p className="text-[#586a80] text-[10px] text-center">PARACATU 360 · PARTICIPAÇÃO CIDADÃ</p>
      </div>
    </div>
  );
}
