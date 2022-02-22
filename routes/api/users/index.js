const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const userRepository = require('../../../data/UserRepository');
const checkJwt = require('../../../utils/middleware/checkJwt');
/**
 *
 * @author My-Anh Chau
 *
 */

/**
 * GET /api/u/ qui retourne tous les utilisateurs avec pagination
 *
 * @author Roger Montero
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await userRepository.getAll(new PaginationParameters(req).getOptions());
    res.status(200)
      .json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/u/login qui ajoute un nouveau utilisateur
 * ou mets à jour ses données (lors de sa connexion avec auth0)
 *
 * @author Roger Montero
 */
router.post('/login', checkJwt, async (req, res, next) => {
  const { body } = req;
  body.email = req.auth.payload['http://localhost//email'];
  try {
    const user = await userRepository.initialUpsertOne(body);
    res
      .status(200)
      .json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
