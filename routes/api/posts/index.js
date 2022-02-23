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
 *
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

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, 'public/images');
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${randomBytes(10).toString('hex')}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * Cette route ajoute un post
 *
 * @author Bly Grâce Schephatia
 */
router.post('/', checkJwt, upload.single('image'), async (req, res, next) => {
  try {
    const { body } = req;
    const email = req.auth.payload['http://localhost//email'];
    const user = await userRepository.findByEmail(email);
    if (!user) throw EntityNotFound();
    // eslint-disable-next-line dot-notation
    body.owner = user['_id'];
    body.image = `/assets/images/${req.file.filename}`;
    await postRepository.insertOne(body);
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Cette route permet d'obtenir un seul post avec son id /api/p/{postId}
 *
 * @author My-Anh Chau
 */
router.get('/:id', async (req, res, next) => {
  try {
  // on get le id
    const { id } = req.params;
    const post = await postRepository.findById(id);
    // si post existe pas ou a pas de nbr de string correspondant
    if (!post) throw EntityNotFound();
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
