// @ts-check
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const { auth } = require('express-oauth2-jwt-bearer');

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('assets', express.static(path.join(__dirname, 'public')));
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
// const checkJwt = auth({
//   audience: process.env.OAUTH_AUDIENCE,
//   issuerBaseURL: process.env.OAUTH_ISSUER_BASE_URL,
// });

app.use('/api', apiRouter);
app.use('/auth', authRouter);

module.exports = app;
