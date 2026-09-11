export type TabName = "inicio" | "mapa" | "nova" | "atividade" | "perfil";

type Props = {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
};

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        stroke={active ? "#075ce5" : "#9aafc4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconMap({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        stroke={active ? "#075ce5" : "#9aafc4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBell({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        stroke={active ? "#075ce5" : "#9aafc4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        stroke={active ? "#075ce5" : "#9aafc4"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type TabProps = {
  label: string;
  tab: TabName;
  active: boolean;
  onNavigate: (tab: TabName) => void;
  icon: React.ReactNode;
};

function Tab({ label, tab, active, onNavigate, icon }: TabProps) {
  return (
    <button
      onClick={() => onNavigate(tab)}
      className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full border-none outline-none bg-transparent cursor-pointer py-[6px]"
    >
      {icon}
      <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold text-[10px] transition-colors ${active ? "text-[#075ce5]" : "text-[#9aafc4]"}`}>
        {label}
      </p>
      {active && <div className="absolute bottom-0 w-[32px] h-[2px] bg-[#075ce5] rounded-full" />}
    </button>
  );
}

export default function Navegacao({ activeTab, onNavigate }: Props) {
  return (
    <div className="bg-white relative shrink-0 w-full border-t border-[#e8eef5]" style={{ height: 64 }}>
      <div className="flex items-stretch h-full px-[4px] relative">
        <Tab label="Início" tab="inicio" active={activeTab === "inicio"} onNavigate={onNavigate} icon={<IconHome active={activeTab === "inicio"} />} />
        <Tab label="Mapa" tab="mapa" active={activeTab === "mapa"} onNavigate={onNavigate} icon={<IconMap active={activeTab === "mapa"} />} />

        {/* Botão central + */}
        <button
          onClick={() => onNavigate("nova")}
          className="flex flex-col items-center justify-center flex-1 h-full border-none outline-none bg-transparent cursor-pointer"
        >
          <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shadow-md transition-all ${activeTab === "nova" ? "bg-[#0a47b8]" : "bg-[#075ce5]"} active:scale-95`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        <Tab label="Atividade" tab="atividade" active={activeTab === "atividade"} onNavigate={onNavigate} icon={<IconBell active={activeTab === "atividade"} />} />
        <Tab label="Perfil" tab="perfil" active={activeTab === "perfil"} onNavigate={onNavigate} icon={<IconUser active={activeTab === "perfil"} />} />
      </div>
    </div>
  );
}
