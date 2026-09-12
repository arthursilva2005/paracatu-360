# Paracatu 360

Protótipo em React, TypeScript e Vite. O gerenciador oficial do desenvolvimento local é o **npm**, com `package-lock.json` como lockfile oficial desse fluxo.

## Executar localmente

```sh
npm install
npm run dev
npm run build
```

O servidor usa a porta 8443. Se ela estiver ocupada, confira se o projeto já está rodando antes de iniciar outra instância.

No PowerShell, se a política de execução impedir os comandos, use `npm.cmd` e `npx.cmd`.

## Verificações

```sh
npx tsc --noEmit
npm run build
```

Para uma instalação limpa e reproduzível a partir do lockfile, use `npm ci`. Esse comando substitui a instalação em `node_modules`; não é necessário executá-lo a cada alteração de código.

Ao alterar dependências em uma tarefa autorizada, mantenha `package.json` e `package-lock.json` juntos. Não use pnpm para instalar ou atualizar dependências no fluxo local oficial. A configuração `.npmrc` mantém a geração e o uso do lockfile do npm habilitados.

## Exceção preservada: integração com Figma Make

A migração para npm é do fluxo local. A integração existente com Figma Make ainda usa pnpm:

- `.mise.toml` mantém Node 22 e a ferramenta pnpm 10.34.3.
- `.figma/make/` usa pnpm para instalação, execução, formatação, builds de publicação e servidor de linguagem.
- `.figma/make/dev.json` observa alterações em `pnpm-lock.yaml`.
- `pnpm-lock.yaml` permanece exclusivamente para compatibilidade com esse fluxo existente.

Os dois lockfiles atualmente fixam versões diferentes: o lockfile do npm registra React/React DOM 19.3.0 e Vite 8.3.0; o do pnpm registra React/React DOM 19.2.4 e Vite 8.0.5. Portanto, trocar o instalador do Figma para o lockfile do npm também alteraria as versões executadas lá. Isso exige uma migração separada, autorizada e validada no Figma.

Não remova `pnpm-lock.yaml`, a ferramenta pnpm do `.mise.toml` ou os scripts do Figma enquanto essa migração não for feita. Também não regenere o lockfile do pnpm durante o desenvolvimento local com npm.

O campo `packageManager` não foi adicionado: declarar npm como gerenciador exclusivo não representa os dois fluxos ainda existentes e pode conflitar com ferramentas que verificam esse campo na integração legada.

## Ambiente da validação desta padronização

- Node.js: 24.21.0.
- npm: 11.19.0.

Essas são as versões observadas no ambiente local de validação, não uma atualização da versão de Node declarada para o Figma. Nenhuma dependência foi atualizada nesta padronização.
