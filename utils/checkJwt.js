const { auth } = require('express-oauth2-jwt-bearer');

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
module.exports = auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: process.env.AUDIENCE,
  tokenSigningAlg: 'RS256',
});
