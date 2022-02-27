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
  try {
    const posts = await postRepository.getAll(
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

// ajouter la route pr addLike
router.get('/:idUser/:idPost', checkJwt, async (req, res, next) => {
  try {
  // on get le id
    const { idUser } = req.params;
    const { idPost } = req.params;
    // const post = await postRepository.findById(idPost);
    // idUser = userLiker
    // idPost = idPost du owner
    await postRepository.addLike(idUser, idPost);
    // si post/user existe pas ou a pas de nbr de string correspondant
    // if (!user || !post) throw EntityNotFound();
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

router.post('/:idPost/favorite', checkJwt, async (req, res, next) => {
  try {
    const { idPost } = req.params;
    // checkJwt
    // await postRepository.addLike(idUser, idPost);
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

// ajouter la route pr removelike
router.delete('/:idUser/:idPost', checkJwt, async (req, res, next) => {
  try {
  // on get le id dans les url params
    const { idUser } = req.params;
    const { idPost } = req.params;
    // const user = await postRepository.findById(idUser);
    // const post = await postRepository.findById(idPost);
    // idUser = userLiker
    // idPost = idPost du owner
    await postRepository.removeLike(idUser, idPost);
    // si post/user existe pas ou a pas de nbr de string correspondant
    // if (!user || !post) throw EntityNotFound();
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
