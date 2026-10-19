import { useEffect } from "react";
import { useLocation } from "react-router";
import Cabecalho from "@/components/Cabecalho";
import Navegacao, { type TabName } from "@/components/Navegacao";

type Props = {
  activeTab: TabName | null;
  onNavigate: (tab: TabName) => void;
};

const etapas = [
  { titulo: "Encontre um problema", texto: "Identifique uma situação urbana que precisa de atenção." },
  { titulo: "Registre a ocorrência", texto: "Informe título, categoria, localização e ao menos uma foto. Se quiser, acrescente uma descrição." },
  { titulo: "A comunidade participa", texto: "Outros moradores podem confirmar que também encontraram o problema." },
  { titulo: "Acompanhe as atualizações", texto: "Veja mudanças de status, histórico e relatos da comunidade." },
  { titulo: "Veja os dados da cidade", texto: "Acompanhe o mapa e os indicadores públicos do Paracatu 360." },
];

const privacidade = [
  { titulo: "Identidade", texto: "Sua identidade não é exibida publicamente nas ocorrências. O registro permanece vinculado internamente à sua conta para permitir edição, segurança e moderação." },
  { titulo: "Localização", texto: "A localização informada é armazenada junto à ocorrência e utilizada para posicioná-la no mapa. Antes de publicar, você pode ajustar o ponto indicado." },
  { titulo: "Fotos", texto: "As fotos enviadas podem ser exibidas publicamente junto à ocorrência. Evite imagens que exponham rostos, placas de veículos, documentos ou outras informações pessoais desnecessárias." },
  { titulo: "Confirmações", texto: "As confirmações ajudam a indicar quantas pessoas também encontraram o problema." },
  { titulo: "Relatos da comunidade", texto: "Relatos da comunidade não alteram automaticamente o status da ocorrência na plataforma." },
  { titulo: "Segurança", texto: "O Paracatu 360 utiliza autenticação e controles de acesso para proteger informações internas da plataforma." },
];

export default function Sobre({ activeTab, onNavigate }: Props) {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.slice(1);
    if (id === "como-funciona" || id === "privacidade") {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="app-screen bg-[#f3f6fa] flex flex-col items-start overflow-clip relative size-full">
      <Cabecalho />
      <div className="screen-scroll flex-1 overflow-y-auto w-full">
        <div className="screen-content flex flex-col gap-[28px] w-full max-w-[1040px] p-[22px] lg:p-[36px]">
          <section aria-labelledby="sobre-titulo" className="w-full">
            <h1 id="sobre-titulo" className="text-[#10284a] text-[26px] sm:text-[30px] font-bold leading-tight">Sobre o Paracatu 360</h1>
            <div className="mt-[16px] max-w-[74ch] space-y-[12px] text-[#425a75] text-[14px] leading-[1.7]">
              <p>O Paracatu 360 é uma plataforma independente de participação cidadã criada para ajudar moradores a registrar, acompanhar e dar visibilidade a problemas urbanos de Paracatu.</p>
              <p>A proposta é reunir informações que muitas vezes ficam espalhadas em conversas, redes sociais e grupos de mensagens, organizando-as por localização, categoria, relevância e status.</p>
              <p>O objetivo é aproximar cidadão, cidade e solução por meio da tecnologia.</p>
            </div>
            <p className="mt-[18px] max-w-[74ch] rounded-[14px] border border-[#d7e3f0] bg-[#e8f0fe] px-[16px] py-[14px] text-[#10284a] text-[13px] leading-[1.65]">
              O Paracatu 360 não representa a Prefeitura de Paracatu, partidos políticos ou candidatos. A plataforma possui caráter independente, institucional e apartidário.
            </p>
          </section>

          <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="w-full scroll-mt-[20px]">
            <h2 id="como-funciona-titulo" className="text-[#10284a] text-[21px] font-bold">Como funciona</h2>
            <p className="mt-[8px] max-w-[74ch] text-[#586a80] text-[14px] leading-[1.65]">
              Você pode explorar ocorrências, mapa e indicadores públicos sem criar uma conta. Para registrar uma ocorrência ou participar, é necessário entrar na plataforma.
            </p>
            <ol className="mt-[16px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              {etapas.map((etapa, indice) => (
                <li key={etapa.titulo} className="flex min-w-0 gap-[12px] rounded-[16px] border border-[#e8eef5] bg-white p-[16px]">
                  <span aria-hidden="true" className="flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[#e8f0fe] text-[#075ce5] text-[13px] font-bold">{indice + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-[#10284a] text-[14px] font-bold">{etapa.titulo}</h3>
                    <p className="mt-[5px] text-[#586a80] text-[13px] leading-[1.6]">{etapa.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="privacidade" aria-labelledby="privacidade-titulo" className="w-full scroll-mt-[20px]">
            <h2 id="privacidade-titulo" className="text-[#10284a] text-[21px] font-bold">Privacidade e confiança</h2>
            <div className="mt-[16px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              {privacidade.map(item => (
                <div key={item.titulo} className="min-w-0 rounded-[16px] border border-[#e8eef5] bg-white p-[16px]">
                  <h3 className="text-[#10284a] text-[14px] font-bold">{item.titulo}</h3>
                  <p className="mt-[6px] text-[#586a80] text-[13px] leading-[1.6]">{item.texto}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Navegacao activeTab={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
