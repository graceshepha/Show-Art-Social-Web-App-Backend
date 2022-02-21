const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const mongoose = require('mongoose');
const { randomBytes } = require('crypto');
const path = require('path');
const multer = require('multer');
const postRepository = require('../../../data/PostRepository');
const checkJwt = require('../../../utils/middleware/checkJwt');

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
    const i = req.body;
    i.owner = mongoose.Types.ObjectId(i.owner);
    i.image = `/assets/images/${req.file.filename}`;
    await postRepository.insertOne(i);
    res.status(201).end();
  } catch (err) {
    next(err);
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
