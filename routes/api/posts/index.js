/**
 * 
 * @author My-Anh Chau            
 * 
 */
const post = require('./post');

router.use(authMiddleware, post);

const router = express.Router();

// routes
const {
    getToutPosts, addPost, removePost,
  } = require('BD/POST');

// ROUTE POUR GET LES POSTS
router.get('/u', async (req, res) => {
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

  // ROUTE POUR AJOUTER UN POST
router.post('/u', async (req, res) => {
    const { idPost, idTag } = req.query;
    try {
      if (!idPost || !idTag) {
        res
          .status(400)
          .json({ status: 400, message: 'Bad Request' });
      } else {
        await addPost({ idUtilisateur: req.userId, idChaussure, idPointure });
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
            idUtilisateur: req.userId, idChaussure, idPointure, quantite,
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
