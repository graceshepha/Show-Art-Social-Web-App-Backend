const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const userRepository = require('../../../data/UserRepository');
const checkJwt = require('../../../utils/middleware/checkJwt');

/**
 * Route `GET /api/u/` qui retourne tous les utilisateurs avec pagination
 *
 * @author Roger Montero
 */
router.get('/', async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  try {
    const users = await userRepository.getAll(
      search,
      new PaginationParameters(req).getOptions(),
    );
    res.status(200)
      .json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * Route `POST /api/u/login` qui ajoute un nouveau utilisateur
 * ou mets à jour ses données au moment de ses connexion
 *
 * @author Roger Montero
 */
router.post('/login', checkJwt, async (req, res, next) => {
  const { body } = req;
  body.email = req.auth.payload['http://localhost//email'];
  try {
    await userRepository.initialUpsertOne(body);
    res.status(201)
      .end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
