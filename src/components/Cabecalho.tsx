import logo from "../imports/logoptu360.jpg";

export default function Cabecalho() {
  return (
    <div className="bg-white relative shrink-0 w-full border-b border-[#d7e3f0]" data-name="Cabeçalho">
      <div className="flex items-center gap-[12px] px-[22px] py-[14px]">
        <img src={logo} alt="Paracatu360" className="w-[40px] h-[40px] object-contain rounded-[8px]" />
        <div className="flex flex-col gap-[2px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold text-[#075ce5] text-[18px] leading-none">Paracatu360</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[10px]">Paracatu, Minas Gerais</p>
        </div>
        <div className="ml-auto">
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#586a80] text-[9px] text-right">PROTÓTIPO</p>
        </div>
      </div>
    </div>
  );
}
