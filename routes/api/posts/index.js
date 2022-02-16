const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const postRepository = require('../../../data/PostRepository');

/**
 * @description ROUTE POUR AJOUTER UN POST
 * @author Bly Grâce Schephatia
 */

<<<<<<< HEAD
const router = require('express').Router();
// IL FAUT USE POSTREPOSITORY
const userRepository = require('../../../data/PostRepository');
// ROUTE POUR AJOUTER UN POST - CREATION D'UNE PUBLICATION
router.post('/add', async (req, res) => {
  try {
    const p = req.body;
    await userRepository.insertOne(p);
=======
router.post('/add', async (req, res) => {
  try {
    const i = req.body;
    await postRepository.insertOne(i);
>>>>>>> 0103907c26d141ee92ec9710cac9ace4754bf9c7
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
<<<<<<< HEAD
// ROUTE POUR GET LES POSTS
router.get('/', async (req, res) => {
  try {
    const users = await userRepository.getAll(req.userId);
    return res
      .status(200)
      .json(users);
=======
/**
 * @description Cette route retourne tous les posts avec pagination
 */
router.get('/', async (req, res) => {
  try {
    const posts = await postRepository.getAll(
      new PaginationParameters(req).getOptions(),
    );
    return res.status(200).json(posts);
>>>>>>> 0103907c26d141ee92ec9710cac9ace4754bf9c7
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});
<<<<<<< HEAD
// ROUTE POUR DELETE UN POST
router.post('/del', async (req, res) => {
  try {
    const p = req.body;
    await userRepository.delOne(p);
    return res
      .status(201)
      .end();
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
=======

/** @description Cette route permet d'obtenir un seul post avec son id /api/p/{postId}  */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  } catch (err) {
    console.error(err);
    res.status();
>>>>>>> 0103907c26d141ee92ec9710cac9ace4754bf9c7
  }
});
// /**
//  *
//  * @author My-Anh Chau
//  *
//  */

<<<<<<< HEAD
router.post('/update', async (req, res) => {
  try {
    const p = req.body;
    await userRepository.update(p);
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
=======
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
>>>>>>> 0103907c26d141ee92ec9710cac9ace4754bf9c7

module.exports = router;
