# Paracatu 360

Plataforma web de participação cidadã para registrar e acompanhar problemas urbanos em Paracatu, Minas Gerais. O projeto está em fase de MVP e ainda passa por validação antes da apresentação final.

## Estado atual

O frontend usa React 19, TypeScript, Vite 8, React Router 7 e Tailwind CSS 4. O Supabase fornece PostgreSQL, autenticação, regras de acesso (RLS) e Storage privado para as fotos.

Já são reais: cadastro e login, sessão persistente, recuperação de senha, categorias ativas, registro de ocorrências com localização escolhida no mapa e endereço/bairro informados pelo usuário, upload de uma a três fotos, listagem e detalhe, confirmações, sinalizações comunitárias, histórico de status, perfil, atividade, mapa, indicadores e moderação por papéis. O status oficial é controlado pelas regras do banco.

O detalhe de ocorrência aceita apenas IDs reais em formato UUID; um ID inválido apresenta o estado de ocorrência não encontrada. Notificações e configurações ainda não possuem fluxo próprio. O cadastro por e-mail e a recuperação dependem da configuração de entrega de e-mails no Supabase.

## Executar localmente

Use Node.js 22.12 ou superior, até a versão 24, e npm. Copie os nomes abaixo para um arquivo local `.env.local` e preencha com os dados públicos do projeto Supabase:

```dotenv
VITE_SUPABASE_URL=<url-do-projeto>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave-publicavel>
```

Esses valores são incorporados ao frontend durante o build. Nunca use a chave `service_role` ou uma chave secreta em variável com prefixo `VITE_`. O arquivo `.env.local` é ignorado pelo Git.

```sh
npm install
npm run dev
npx tsc --noEmit
npm run build
```

O servidor local usa a porta 8443 por padrão. O build gera `dist/`.

## Rotas

| Públicas | Acesso |
| --- | --- |
| `/`, `/mapa`, `/indicadores`, `/ocorrencias/:id` | Consulta |
| `/entrar`, `/recuperar-senha`, `/redefinir-senha` | Autenticação e recuperação |

| Protegidas | Acesso |
| --- | --- |
| `/ocorrencias/nova`, `/atividade`, `/perfil` | Usuário autenticado |
| `/moderacao`, `/moderacao/:id` | Moderador ou administrador |

O aplicativo usa `BrowserRouter`. Na Vercel, `vercel.json` reescreve os caminhos da aplicação para `index.html` para permitir acesso direto e recarga das rotas. RLS e permissões do Supabase continuam sendo a proteção dos dados.

## Preview Deployment

A branch de trabalho atual é `feature/supabase`; `desenvolvimento` é a branch de integração e `main` fica reservada para produção aprovada. Não há URL de deploy definida neste repositório.

Na Vercel, configure o projeto como Vite, Node.js 24.x e as duas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nos ambientes que forem utilizados. O repositório fixa `npm ci` para instalação e `npm run build` para gerar `dist/`, porque o lockfile npm convive com o lockfile pnpm preservado para a integração Figma Make.

Após obter a URL de Preview, adicione ao Supabase Auth apenas os retornos necessários para esse endereço, especialmente `/redefinir-senha`. O cadastro atual usa a Site URL configurada no Supabase quando não informa um redirecionamento próprio.

## Próximas etapas

- Validar os fluxos reais, as rotas diretas e a responsividade no Preview.
- Configurar entrega de e-mail adequada antes de abrir o cadastro ao público.
- Revisar textos, registros legados e acabamento visual para a apresentação.
- Fazer auditoria de segurança e melhorias de desempenho antes do lançamento final.

## Equipe

Arthur, Bruno, Samuel, Hugo, Rodrigo e Vinicius.
