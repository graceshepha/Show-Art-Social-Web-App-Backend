const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const mongoose = require('mongoose');
const { requiredScopes } = require('express-oauth2-jwt-bearer');
const { randomBytes } = require('crypto');
const path = require('path');
const multer = require('multer');
const postRepository = require('../../../data/PostRepository');

/**
 * @description ROUTE POUR AJOUTER UN POST
 * @author Bly Grâce Schephatia
 */

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, 'public/images');
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${randomBytes(32).toString('hex')}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const i = req.body;
    i.owner = mongoose.Types.ObjectId(i.owner);
    i.image = `/assets/images/${req.file.filename}`;
    await postRepository.insertOne(i);
    return res.status(201).end();
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});
/**
 * @description Cette route retourne tous les posts avec pagination
 * @author Bly, Grâce Schephatia
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

/** @description Cette route permet d'obtenir un seul post avec son id /api/p/{postId}  */
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//   } catch (err) {
//     console.error(err);
//     res.status();
//   }
// });
// /**
//  *
//  * @author My-Anh Chau
//  *
//  */

// // ROUTE POUR GET LES POSTS
// router.get("/", async (req, res) => {
//   try {
//     const items = await getToutPosts(req.userId);
//     res.status(200).json(items);
//   } catch {
//     res.status(500).json({ status: 500, message: "Internal Server Error" });
//   }
// });

// // ROUTE POUR GET UN POST AVEC ID
// router.get("/:idPost", async (req, res) => {
//   const { idPost, idTag } = req.query;
//   try {
//     if (!idPost || !idTag) {
//       res.status(400).json({ status: 400, message: "Bad Request" });
//     } else {
//       await addPost({ idUtilisateur: req.userId, idPost, idTag });
//       res.status(200).end();
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: 500, message: "Internal Server Error" });
//   }
// });

// // ROUTE POUR AJOUTER UN POST
// router.post("/", async (req, res) => {
//   const { idPost, idTag } = req.query;
//   try {
//     if (!idPost || !idTag) {
//       res.status(400).json({ status: 400, message: 'Bad Request' });
//     } else {
//       await addPost({ idUtilisateur: req.userId, idPost, idTag });
//       res.status(200).end();
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: 500, message: 'Internal Server Error' });
//   }
// });

// // ROUTE POUR ENLEVER UN POST
// router.delete("/p", async (req, res) => {
//   const { idPost, idTag } = req.query;
//   try {
//     if (!idPost || !idTag) {
//       res.status(400).json({ status: 400, message: 'Bad Request' });
//     } else {
//       await removePost({
//         idUtilisateur: req.userId,
//         idPost,
//       });
//       res.status(200).end();
//     }
//   } catch {
//     res.status(500).json({ status: 500, message: 'Internal Server Error' });
//   }
// });

module.exports = router;
