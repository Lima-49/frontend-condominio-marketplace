// Ambiente de desenvolvimento local (`ng serve`).
// Nao ha backend real rodando ainda: aponta para a URL do contrato (docs/architecture/API_SPEC.md).
// Troque para `http://localhost:3000/api` (ou a porta combinada com o Backend) quando o servidor
// NestJS estiver de pe localmente.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  whatsappCountryCode: '55'
};
