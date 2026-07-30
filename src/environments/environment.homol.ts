// Ambiente de homologacao (branch `homol`, preview deploy no Cloudflare Pages).
// URL do backend de homologacao no Render — ver docs/architecture/DEPLOY.md.
export const environment = {
  production: true,
  apiUrl: 'https://vitrine-condominio-backend-homol.onrender.com/api',
  whatsappCountryCode: '55'
};
