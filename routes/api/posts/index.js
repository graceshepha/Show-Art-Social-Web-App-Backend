/**
 * 
 * @author My-Anh Chau            
 * 
 */
const post = require('./post');
const postRepository = require('../../../data/UserRepository');

const router = express.Router();

// routes


// ROUTE POUR GET LES POSTS
router.get('/', async (req, res) => {
  try {
    const items = await getToutPosts(req.userId);
    res
      .status(200)
      .json(items);
  } catch {
    res
      .status(500)
      .json({ status: 500, message: 'Internal Server Error' });
  }
});

// ROUTE POUR GET UN POST AVEC ID
router.get('/:idPost', async (req, res) => {
  const { idPost, idTag } = req.query;
  try {
    if (!idPost || !idTag) {
      res
        .status(400)
        .json({ status: 400, message: 'Bad Request' });
    } else {
      await addPost({ idUtilisateur: req.userId, idPost, idTag });
      res
        .status(200)
        .end();
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: 500, message: 'Internal Server Error' });
  }
});

// ROUTE POUR AJOUTER UN POST
router.post('/', async (req, res) => {
  const { idPost, idTag } = req.query;
  try {
    if (!idPost || !idTag) {
      res
        .status(400)
        .json({ status: 400, message: 'Bad Request' });
    } else {
      await addPost({ idUtilisateur: req.userId, idPost, idTag });
      res
        .status(200)
        .end();
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: 500, message: 'Internal Server Error' });
  }
});



// ROUTE POUR ENLEVER UN POST
router.delete('/p', async (req, res) => {
  const { idPost, idTag } = req.query;
  try {
    if (!idPost || !idTag) {
      res
        .status(400)
        .json({ status: 400, message: 'Bad Request' });
    } else {
      await removePost({
        idUtilisateur: req.userId, idPost,
      });
      res
        .status(200)
        .end();
    }
  } catch {
    res
      .status(500)
      .json({ status: 500, message: 'Internal Server Error' });
  }
});




module.exports = router;
