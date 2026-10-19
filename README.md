# Paracatu 360

O Paracatu 360 é uma plataforma web de participação cidadã para registrar e acompanhar problemas urbanos em Paracatu, Minas Gerais. Abrange relatos sobre vias, infraestrutura, limpeza urbana, meio ambiente, saneamento e segurança.
O Paracatu 360 é uma iniciativa independente e apartidária e não representa oficialmente a Prefeitura de Paracatu.

**Produção / Demo online:** [paracatu-360.vercel.app](https://paracatu-360.vercel.app)

## Estado atual

Os fluxos ativos utilizam dados reais do Supabase. O aplicativo oferece autenticação, registro e consulta de ocorrências, fotos, localização em mapa, confirmações, sinalizações comunitárias, histórico oficial, indicadores e moderação. As informações persistem após recarregar a página. Os arquivos de origem e integração com Figma Make permanecem no repositório, mas não são a fonte das ocorrências exibidas pelo aplicativo.

## Tecnologias

- **Frontend:** React 19, TypeScript 5.7, Vite 8, React Router 7 e Tailwind CSS 4.
- **Dados e acesso:** Supabase PostgreSQL, Auth, Storage privado, Row Level Security (RLS) e funções RPC.
- **Localização:** geolocalização do navegador e mapas com tiles do OpenStreetMap; endereço e bairro são informados pelo usuário.
- **Hospedagem:** Vercel.
- **Gerenciador local:** npm, com `package-lock.json` como lockfile do fluxo local.

## Funcionalidades

**Cidadão:** consultar ocorrências e seus detalhes, filtrar por categoria, visualizar o mapa e indicadores, criar ocorrência com localização e uma a três fotos, confirmar que também encontrou um problema, sinalizar a situação observada, acompanhar o histórico, consultar Atualizações e ver as próprias ocorrências. Cadastro, login, recuperação de senha e sessão persistente usam Supabase Auth.

**Equipe:** moderadores e administradores acessam a área de moderação para analisar ocorrências, alterar o status oficial, registrar decisões no histórico e marcar duplicidades conforme suas permissões.

As sete categorias oficiais, carregadas do Supabase, são: Trânsito e Vias, Infraestrutura, Limpeza Urbana, Meio Ambiente, Água e Saneamento, Segurança e Outros.

Os status oficiais são: Registrado, Em análise, Encaminhado, Em andamento, Resolvido, Rejeitado, Duplicado e Arquivado. O cidadão não altera diretamente o status oficial. Uma sinalização comunitária — **Atendimento começou**, **Problema resolvido**, **Continua igual** ou **Piorou** — expressa a percepção de quem passou pelo local e não muda automaticamente esse status.

Uma confirmação indica que outra pessoa também encontrou o problema. A relevância exibida é derivada das confirmações ativas: **baixa** de 0 a 14, **média** de 15 a 29 e **alta** a partir de 30. Essa classificação não é uma prioridade oficial de atendimento.

Os papéis são **cidadão**, **moderador** e **administrador**. As ações disponíveis dependem do papel e das permissões aplicadas pelo banco.

## Rotas

| Rota | Acesso | Conteúdo |
| --- | --- | --- |
| `/` | Público | Início e listagem de ocorrências |
| `/entrar` | Público | Login e cadastro |
| `/recuperar-senha` | Público | Solicitação de recuperação de senha |
| `/redefinir-senha` | Público | Definição de nova senha |
| `/mapa` | Público | Mapa de ocorrências |
| `/sobre` | Público | Sobre o Paracatu 360, funcionamento, privacidade e confiança |
| `/ocorrencias/:id` | Público, conforme visibilidade da ocorrência | Detalhe e histórico |
| `/indicadores` | Público | Indicadores da cidade |
| `/ocorrencias/nova` | Usuário autenticado | Registro de ocorrência |
| `/atividade` | Usuário autenticado | Atualizações relacionadas às ocorrências e à participação do usuário |
| `/perfil` | Usuário autenticado | Dados pessoais e próprias ocorrências |
| `/moderacao` | Moderador ou administrador | Lista de moderação |
| `/moderacao/:id` | Moderador ou administrador | Análise administrativa |

O aplicativo usa React Router com `createBrowserRouter` e `RouterProvider`. A configuração da Vercel reescreve as rotas para `index.html`, permitindo acesso direto e recarga da página. A proteção efetiva dos dados está nas permissões e políticas RLS do Supabase.

## Executar localmente

É necessário Node.js `>=22.12.0 <25` e npm. Crie um arquivo `.env.local` na raiz com os valores públicos correspondentes ao projeto Supabase:

```dotenv
VITE_SUPABASE_URL=<url-do-projeto>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave-publicavel>
```

O arquivo `.env.local` é ignorado pelo Git. Nunca coloque `service_role` ou outra chave secreta em variáveis com prefixo `VITE_`: elas são incorporadas ao frontend durante o build.

```sh
npm install
npm run dev
```

Para uma instalação reproduzível a partir do lockfile, use `npm ci` no lugar de `npm install`. No PowerShell do Windows, os comandos também podem ser executados como `npm.cmd run dev`. O servidor Vite usa a porta **8443** por padrão, salvo quando `PORT` estiver definido.

Para verificar tipos e gerar a versão de produção:

```sh
npx tsc --noEmit
npm run build
```

O build gera `dist/`. Não há suíte automatizada de testes configurada nesses scripts.

## Estrutura do projeto

```text
src/
  components/   Componentes de interface
  screens/      Telas associadas às rotas
  hooks/        Hooks de consulta e estado
  lib/          Integração com Supabase e regras específicas
  data/         Tipos e metadados compartilhados
supabase/
  migrations/   Schema e evolução das regras do banco
public/         Recursos estáticos
```

As migrations em `supabase/migrations/` abrangem schema inicial, segurança, fotos, confirmações, consulta das próprias ocorrências, moderação, ajuste de permissões de edição, duplicidades e sinalizações comunitárias. A aplicação usa Auth, PostgreSQL, Storage privado, RLS e RPCs; a interface não contém chave de serviço nem substitui as regras de acesso do banco.

Os diretórios `.figma/`, `src/imports/` e `imports/` preservam materiais de origem ou integração do Figma Make. Não devem ser confundidos com o fluxo de dados ativo. O documento em `plans/` registra o planejamento inicial e é uma **referência histórica**; este README descreve o estado atual.

## Deploy e branches

Na Vercel, `vercel.json` define `npm ci`, `npm run build`, saída em `dist/` e rewrite de SPA. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de deploy. Os retornos de autenticação e recuperação de senha também precisam estar autorizados na configuração do Supabase Auth para o domínio utilizado.

O fluxo de branches do projeto usa `main` para produção, `desenvolvimento` para integração e testes, e `feature/*` para trabalhos isolados. O lockfile pnpm e a configuração `.mise.toml` permanecem apenas para compatibilidade com a integração existente do Figma Make; no desenvolvimento local, use npm.

## Evoluções futuras

O projeto pode evoluir com domínio próprio, SMTP dedicado e e-mails personalizados, sugestão automática de duplicidade, rascunho local, melhorias adicionais de desempenho e notificações. Essas melhorias não são requisitos para os fluxos reais já disponíveis. SMTP dedicado/Resend não está configurado neste repositório; para ampliar o uso público, convém revisar a entrega de e-mails do Supabase Auth.

## Contexto acadêmico e equipe

Projeto desenvolvido no contexto de um trabalho acadêmico de Análise e Desenvolvimento de Sistemas, com possibilidade de evolução para uso profissional.

**Equipe:** Arthur, Bruno, Samuel, Hugo, Rodrigo e Vinicius.
