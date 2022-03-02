const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const { randomBytes } = require('crypto');
const path = require('path');
const multer = require('multer');
const postRepository = require('../../../data/PostRepository');
const userRepository = require('../../../data/UserRepository');
const checkJwt = require('../../../utils/middleware/checkJwt');
const { EntityNotFound } = require('../../../utils/errors');

/**
 * Cette route retourne tous les posts avec pagination
 * @author Bly, Grâce Schephatia
 */
router.get('/', async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  try {
    const posts = await postRepository.getAll(
      search,
      new PaginationParameters(req).getOptions(),
    );
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
});

/**
 * Le storage pour `multer`.
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, 'public/images');
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${randomBytes(10).toString('hex')}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
/**
 * Middleware pour obtenir et sauvegarder les images reçus à des routes.
 */
const upload = multer({ storage });

/**
 * Cette route ajoute un post
 * @author Bly Grâce Schephatia
 */
router.post('/', checkJwt, upload.single('image'), async (req, res, next) => {
  try {
    const { body } = req;
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    // eslint-disable-next-line dot-notation
    body.owner = user._id;
    body.image = `/assets/images/${req.file.filename}`;
    await postRepository.insertOne(body);
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Cette route permet d'obtenir un seul post avec son id /api/p/{postId}
 * @author My-Anh Chau
 */
router.get('/:id', async (req, res, next) => {
  try {
  // on get le id
    const { id } = req.params;
    const post = await postRepository.findPostById(id);
    if (!post) throw EntityNotFound();
    res.status(200).json(post.toJSON({ virtuals: true }));
  } catch (err) {
    next(err);
  }
});

/**
 * Route `POST /api/p/:id/view` qui ajoute un view à un post.
 * @author Roger Montero
 */
router.post('/:id/view', async (req, res, next) => {
  const { id } = req.params;
  try {
    await postRepository.addView(id);
    res.status(201)
      .end();
  } catch (err) {
    next(err);
  }
});

/**
 * Route `POST /api/p/:id/comment` pour ajouter un commentaire qui retourne une réponse 200
 * avec le array des comments du post.
 * @author Roger Montero
 */
router.post('/:id/comment', checkJwt, async (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    const user = await userRepository.findByEmail(req.auth.payload['http://localhost//email']);
    if (!user) throw EntityNotFound(); // shouldn't be the case
    const post = await postRepository.addComment(id, {
      user: user._id,
      comment,
    });
    res.status(200)
      .json(post.comments.toObject({ virtuals: true }));
  } catch (err) {
    next(err);
  }
});

/**
 * La route pour voir si post a ete like
 * @author Roger Montero
 */
router.get('/:id/like', checkJwt, async (req, res, next) => {
  const { id } = req.params;
  try {
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    const hasLiked = await postRepository.hasLiked(user.id, id);
    res.status(200).json({ hasLiked });
  } catch (err) {
    next(err);
  }
});

/**
 * La route pour ajouter un like
 * @author My-Anh Chau
 */
router.post('/:idPost/like', checkJwt, async (req, res, next) => {
  try {
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    const { idPost } = req.params;
    await postRepository.addLike(user.id, idPost);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * La route pour enlever un like
 * @author My-Anh Chau
 */
router.delete('/:idPost/like', checkJwt, async (req, res, next) => {
  try {
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    const { idPost } = req.params;
    await postRepository.removeLike(user.id, idPost);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
