const express = require('express');
const users = require('./users');
const posts = require('./posts');
const userRepository = require('../../data/UserRepository');
const { EntityNotFound } = require('../../utils/errors');
const checkJwt = require('../../utils/middleware/checkJwt');

const router = express.Router();

// routes
router.use('/u', users);
router.use('/p', posts);

/**
 * Route `GET /api/me` pour obtenir les données de l'utilisateur connecté
 * @author Bly Grâce Schephatia
 */
router.get('/me', checkJwt, async (req, res, next) => {
  try {
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findAllUserInfoByEmail(email);
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
