const { auth } = require('express-oauth2-jwt-bearer');

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
module.exports = auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: process.env.AUDIENCE,
  tokenSigningAlg: 'RS256',
});

// si le code en haut ne fonctionne pas
// module.exports = auth({
//   jwksUri: process.env.JWKS_URI,
//   issuer: process.env.ISSUER,
//   audience: process.env.AUDIENCE,
//   tokenSigningAlg: 'RS256',
// });
