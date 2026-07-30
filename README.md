# Frontend — Vitrine do Condominio

Aplicacao Angular (standalone components, Angular 18) do MVP "Vitrine do Condominio". Ver `../CLAUDE.md`
e `../docs/` (especialmente `docs/architecture/API_SPEC.md` e `docs/design/DESIGN_BRIEF.md`) para o
contexto completo de produto/contrato de API.

## Setup

```bash
npm install
```

## Ambiente / URL da API

A URL base da API (contrato em `docs/architecture/API_SPEC.md`, base `/api`) e configurada em
`src/environments/`:

- `environment.development.ts` — usado por `ng serve` (default: `http://localhost:3000/api`).
- `environment.ts` — usado no build de producao (`/api`, ajustar para o dominio real do backend).

Nao ha necessidade de backend real rodando para o frontend compilar/rodar: os services (`src/app/core/services`)
apontam para `environment.apiUrl` e podem ser apontados para qualquer instancia (local, staging, mock)
sem alterar codigo.

## Desenvolvimento

```bash
npm start        # ng serve — http://localhost:4200
npm run build    # ng build
npm test         # ng test (Karma/Jasmine)
```

## Estrutura

```
src/app/
  core/            # services de API, guards de rota, interceptors HTTP, models/types
  shared/          # componentes, pipes e validators reutilizaveis entre dominios
  auth/            # login, cadastro
  products/        # vitrine, detalhe, criar/editar produto
  account/         # meus anuncios
  layout/          # shell (header + bottom nav) das rotas privadas, tela 404
```

## Validacao de formularios

Login, Cadastro e Criar/Editar produto usam Reactive Forms com validacao client-side
(`src/app/shared/validators/custom-validators.ts`). Essa validacao existe apenas para dar
feedback rapido de UX — o backend (NestJS, DTOs com `class-validator`) **sempre** revalida tudo
e e a fonte de verdade (ver CLAUDE.md, secao "Padroes tecnicos").
