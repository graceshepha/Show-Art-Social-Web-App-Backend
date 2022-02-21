const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const userRepository = require('../../../data/UserRepository');
const checkJwt = require('../../../utils/checkJwt');
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
router.get('/', async (req, res) => {
  try {
    const users = await userRepository.getAll(new PaginationParameters(req).getOptions());
    return res
      .status(200)
      .json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});

/**
 * POST /api/u/login qui ajoute un nouveau utilisateur
 * ou mets à jour ses données (lors de sa connexion avec auth0)
 *
 * @author Roger Montero
 */
router.post('/login', checkJwt, async (req, res) => {
  const { body } = req;
  const emailAuth = req.auth.payload['http://localhost//email'];
  if (body.email !== emailAuth) {
    return res.sendStatus(401);
  }
  try {
    const user = await userRepository.initialUpsertOne(body);
    return res
      .status(200)
      .json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});

module.exports = router;
