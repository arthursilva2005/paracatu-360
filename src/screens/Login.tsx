import logo from "../imports/logoptu360.jpg";

type Props = {
  onLogin: () => void;
};

export default function Login({ onLogin }: Props) {
  return (
    <div className="bg-[#f3f6fa] flex flex-col items-center justify-between size-full overflow-hidden" data-name="Login">
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
      <div className="flex-1 w-full flex flex-col justify-center px-[28px] gap-[20px]">
        <div className="flex flex-col gap-[6px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[24px]">Bem-vindo!</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[14px]">Entre para acompanhar e registrar ocorrências na sua cidade.</p>
        </div>

        <div className="flex flex-col gap-[12px]">
          {/* E-mail */}
          <div className="flex flex-col gap-[6px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">E-mail</p>
            <input
              type="email"
              placeholder="seu@email.com"
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-[6px]">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#10284a] text-[13px]">Senha</p>
            <input
              type="password"
              placeholder="••••••••"
              className="bg-white rounded-[14px] px-[16px] py-[14px] border border-[#d7e3f0] font-['Inter:Regular',sans-serif] font-normal text-[#10284a] text-[14px] outline-none focus:border-[#075ce5] transition-colors placeholder:text-[#b0bfce] w-full"
            />
          </div>

          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#075ce5] text-[13px] text-right cursor-pointer">Esqueci minha senha</p>
        </div>

        {/* Botão entrar */}
        <button
          className="bg-[#075ce5] hover:bg-[#0a47b8] active:bg-[#083a96] active:scale-[0.98] w-full rounded-[16px] py-[16px] cursor-pointer border-none outline-none transition-all duration-150 shadow-md hover:shadow-lg"
          onClick={onLogin}
        >
          <p className="font-['Inter:Bold',sans-serif] font-bold text-white text-[16px] text-center">Entrar</p>
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
      </div>

      {/* Rodapé */}
      <div className="w-full px-[28px] pb-[28px] pt-[8px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[10px] text-center">PROTÓTIPO · DADOS DE DEMONSTRAÇÃO</p>
      </div>
    </div>
  );
}
