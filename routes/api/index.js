const express = require('express');
const users = require('./users');
const posts = require('./posts');

const router = express.Router();

// routes
router.use('/u', users);
// on va pas l'utiliser encore
router.use('/p', posts);

module.exports = router;

/*
C reate
R ead
U pdate
D elete

routes dans lapi
    http://localhost/api/u -> routes pour les CRUD des utilisateurs
        - POST http://localhost/api/u/add

routes dans lapi
    http://localhost/api/p -> routes pour les CRUD des posts
        - GET http://localhost/api/p/
        - GET http://localhost/api/p/:id
        - POST http://localhost/api/p/
*/
