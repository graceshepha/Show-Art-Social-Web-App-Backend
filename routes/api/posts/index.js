const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const mongoose = require('mongoose');
const postRepository = require('../../../data/PostRepository');

/**
 * @description ROUTE POUR AJOUTER UN POST
 * @author Bly Grâce Schephatia
 */

router.post('/add', async (req, res) => {
  try {
    const i = req.body;
    i.owner = mongoose.Types.ObjectId(i.owner);
    await postRepository.insertOne(i);
    return res
      .status(201)
      .end();
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});
/**
 * @description Cette route retourne tous les posts avec pagination
 */
router.get('/', async (req, res) => {
  try {
    const posts = await postRepository.getAll(
      new PaginationParameters(req).getOptions(),
    );
    return res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});

// ESSAYER DE CONTINUER TRUC DE GRACE

/** @description Cette route permet d'obtenir un seul post avec son id /api/p/{postId}  */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postRepository.getOne(id);
  } catch (err) {
    console.error(err);
    res.status();
  }
});

module.exports = router;
