import { Link } from "react-router";

const logo = `${import.meta.env.BASE_URL}logoptu360.jpg`;

export default function Cabecalho() {
  return (
    <header className="bg-white shrink-0 w-full border-b border-[#d7e3f0] lg:hidden" data-name="Cabeçalho">
      <div className="flex items-center gap-[12px] px-[20px] py-[10px]">
        <img src={logo} alt="" className="w-[40px] h-[40px] object-contain rounded-[8px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[18px] leading-none">Paracatu 360</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[11px]">Paracatu, Minas Gerais</p>
        </div>
        <Link to="/sobre" aria-label="Sobre o Paracatu 360"
          className="ml-auto flex size-[44px] shrink-0 items-center justify-center rounded-full border border-[#d7e3f0] bg-white text-[#586a80] no-underline hover:bg-[#e8f0fe] hover:text-[#075ce5]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
