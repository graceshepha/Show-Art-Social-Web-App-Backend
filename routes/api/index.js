const express = require('express');
const users = require('./users');
const posts = require('./posts');
const userRepository = require('../../data/UserRepository');
const { EntityNotFound } = require('../../utils/errors');
const checkJwt = require('../../utils/middleware/checkJwt');

const router = express.Router();

// routes
router.use('/u', users);
// on va pas l'utiliser encore
router.use('/p', posts);

/**
 * @author Bly Grâce Schephatia
 */
router.get('/me', checkJwt, async (req, res, next) => {
  try {
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

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
