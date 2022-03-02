const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const userRepository = require('../../../data/UserRepository');
const { EntityNotFound } = require('../../../utils/errors');
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

/**
 * Route `GET /api/u/:username` qui retourne les informations d'un utilisateur
 *
 * @author Roger Montero
 */
router.get('/:username', async (req, res, next) => {
  const { username } = req.params;
  const select = 'username email picture details';
  try {
    const user = await userRepository
      .findByUsernameSelect(username.toLowerCase(), select);
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

/**
 * Route `GET /api/u/:username/posts` qui retourne les posts d'un utilisateur
 *
 * @author Roger Montero
 */
router.get('/:username/posts', async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await userRepository
      .findUserPostsByUsername(username.toLowerCase());
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.posts.toObject());
  } catch (err) {
    next(err);
  }
});

/**
 * Route `GET /api/u/:username/likes` qui retourne les likes d'un utilisateur
 *
 * @author Roger Montero
 */
router.get('/:username/likes', async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await userRepository
      .findUserLikesByUsername(username.toLowerCase());
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.likedPosts.toObject());
  } catch (err) {
    next(err);
  }
});

/**
 * Route `GET /api/u/:username/followers` qui retourne les followers d'un utilisateur
 *
 * @author Roger Montero
 */
router.get('/:username/followers', async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await userRepository
      .findUserFollowersByUsername(username.toLowerCase());
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.followers.toObject());
  } catch (err) {
    next(err);
  }
});

/**
 * Route `GET /api/u/:username/following` qui retourne les utilisateurs
 * following cet utilisateur
 *
 * @author Roger Montero
 */
router.get('/:username/following', async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await userRepository
      .findUserFollowingByUsername(username.toLowerCase());
    if (!user) throw EntityNotFound();
    res.status(200)
      .json(user.following.toObject());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
