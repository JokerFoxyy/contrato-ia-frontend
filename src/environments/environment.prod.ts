export const environment = {
  production: true,
  apiUrl: 'https://api.contrato-ia.com.br/api',  // Substitua pela URL do Railway/Render
  keycloak: {
    url: 'https://auth.contrato-ia.com.br',       // Substitua pela URL do Keycloak em produção
    realm: 'contrato-ia',
    clientId: 'contrato-ia-frontend',
  },
};
