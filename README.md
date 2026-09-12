# Paracatu 360

O Paracatu 360 é um protótipo de participação cidadã para Paracatu, Minas Gerais. A aplicação permite registrar problemas da cidade, consultar ocorrências, acompanhar seu status e visualizar indicadores básicos da atividade urbana.

## Estado atual

O projeto está em fase de protótipo frontend. Os dados são mockados e as novas ocorrências ficam em memória durante a sessão. A navegação usa React Router e as telas preservam layouts para desktop e mobile.

## Tecnologias

- React 19 e React DOM 19
- TypeScript 5.7
- Vite 8
- React Router 7
- Tailwind CSS 4
- Oxfmt para formatação
- npm como gerenciador local, com `package-lock.json`

## Rotas

| Rota | Tela |
| --- | --- |
| `/entrar` | Login do protótipo |
| `/` | Início, filtros e lista de ocorrências |
| `/mapa` | Mapa demonstrativo e ocorrências |
| `/ocorrencias/nova` | Formulário de nova ocorrência |
| `/ocorrencias/:id` | Detalhes da ocorrência pelo ID |
| `/atividade` | Atividade e ocorrências recentes |
| `/perfil` | Perfil mockado e ocorrências relacionadas |
| `/indicadores` | Dashboard 360 |

IDs inexistentes em `/ocorrencias/:id` retornam para a Home de forma segura.

## Como executar

```sh
npm install
npm run dev
```

O servidor de desenvolvimento usa a porta 8443. Para gerar a versão de produção:

```sh
npm run build
```

Verificação TypeScript:

```sh
npx tsc --noEmit
```

## Funcionalidades atuais

- navegação por rotas, com suporte ao histórico do navegador;
- início com ordenação por relevância e filtros pelas categorias atuais;
- cadastro de ocorrência em memória;
- título digitado com validação de 5 a 80 caracteres;
- descrição limitada a 300 caracteres;
- estado de sucesso após o cadastro, com ações para ver a ocorrência ou voltar ao início;
- detalhe de ocorrência por ID;
- confirmação de uma ocorrência uma vez por sessão;
- cálculo de relevância a partir da quantidade de confirmações;
- mapa, atividade, perfil e indicadores usando os dados mockados atuais;
- navegação lateral no desktop e inferior no mobile.

## O que ainda é mock ou futuro

- não há Supabase, backend, persistência ou autenticação real;
- localização, GPS e mapa são demonstrativos;
- fotos e vídeos não são enviados; o cadastro usa `fotos: []`;
- sinalizações da comunidade, histórico de status, permissões e moderação ainda são apenas contratos de dados;
- datas exibidas nos mocks usam textos ilustrativos; os objetos já possuem timestamps ISO para evolução futura;
- categorias oficiais dinâmicas coexistem temporariamente com os nomes legados exibidos pela interface para preservar o visual e os filtros atuais.

## Modelo resumido de Ocorrência

O contrato principal está em `src/data/ocorrencias.ts`:

```ts
interface Ocorrencia {
  id: string;
  autorId: string;
  categoriaId: string;
  titulo: string;
  descricao: string;
  status: StatusOcorrencia;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  fotos: FotoOcorrencia[];
  criadoEm: string;
  atualizadoEm: string;
  resolvidoEm: string | null;
  arquivadoEm: string | null;
  ocorrenciaPrincipalId: string | null;
  quantidadeConfirmacoes: number;
}
```

Os IDs são strings para manter compatibilidade com os mocks atuais e futuros UUIDs. Status usam códigos internos, como `registrado`, `em_analise`, `encaminhado`, `em_andamento` e `resolvido`, enquanto textos e cores da interface vêm de metadados centralizados. A relevância é derivada: 0–14 confirmações representam baixa, 15–29 média e 30 ou mais alta.

## Roadmap

1. Persistência das ocorrências em backend.
2. Autenticação e autoria privada.
3. Upload de uma a três fotos por ocorrência.
4. GPS e mapa com localização ajustável.
5. Histórico e sinalizações da comunidade.
6. Gestão de categorias, status e permissões de moderação.

## Equipe

Projeto Paracatu 360 — equipe de produto, design e desenvolvimento responsável pelo protótipo de participação cidadã.

## Escopo desta documentação

Este README foi atualizado com base somente em `README.md`, `package.json`, `src/App.tsx` e `src/data/ocorrencias.ts`, conforme solicitado. Descrições detalhadas de componentes, estilos, assets e telas não foram ampliadas porque exigiriam analisar outros arquivos.
