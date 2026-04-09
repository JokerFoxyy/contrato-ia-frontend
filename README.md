# ContratoIA - Frontend

Interface web da plataforma de geração de contratos jurídicos com inteligência artificial, focada no mercado brasileiro.

## Stack

- **Angular 17** (standalone components)
- **TailwindCSS** + **Angular Material**
- **Keycloak-js** (autenticação)
- **Deploy:** Vercel

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend rodando (veja [contrato-ia-backend](https://github.com/JokerFoxyy/contrato-ia-backend))

## Rodando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Certifique-se de que o backend está rodando em localhost:8080
# 3. Certifique-se de que o Keycloak está rodando em localhost:8180

# 4. Inicie o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

## Estrutura do projeto

```
src/app/
├── core/
│   ├── auth/            # KeycloakService, AuthGuard
│   ├── interceptors/    # AuthInterceptor (Bearer token)
│   └── services/        # ApiService (comunicação com backend)
├── features/
│   ├── dashboard/       # Tela inicial com stats e atalhos
│   ├── documents/
│   │   ├── document-create/   # Formulário de geração de contrato
│   │   ├── document-result/   # Visualização do contrato gerado
│   │   └── document-list/     # Lista de documentos do usuário
│   └── login/           # Tela de login
└── shared/
    └── components/      # Componentes reutilizáveis
```

## Telas

| Rota              | Componente              | Descrição                             |
|-------------------|-------------------------|---------------------------------------|
| `/dashboard`      | DashboardComponent      | Boas-vindas, stats, templates rápidos |
| `/documents/new`  | DocumentCreateComponent | Input livre + exemplos de contratos   |
| `/documents/:id`  | DocumentResultComponent | Contrato gerado + copiar/exportar     |
| `/documents`      | DocumentListComponent   | Lista paginada de documentos          |
| `/login`          | LoginComponent          | Tela de login via Keycloak            |

## Configuração de ambiente

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'contrato-ia',
    clientId: 'contrato-ia-frontend',
  },
};
```

## Build para produção

```bash
npm run build:prod
```

O output será gerado em `dist/contrato-ia-frontend/`. O `vercel.json` já configura os rewrites para SPA routing.
