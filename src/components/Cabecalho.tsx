const logo = `${import.meta.env.BASE_URL}logoptu360.jpg`;

export default function Cabecalho() {
  return (
    <header className="bg-white shrink-0 w-full border-b border-[#d7e3f0] lg:hidden" data-name="Cabeçalho">
      <div className="flex items-center gap-[12px] px-[20px] py-[10px]">
        <img src={logo} alt="" className="w-[40px] h-[40px] object-contain rounded-[8px]" />
        <div className="flex flex-col gap-[2px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[18px] leading-none">Paracatu 360</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[11px]">Paracatu, Minas Gerais</p>
        </div>
      </div>
    </header>
  );
}
