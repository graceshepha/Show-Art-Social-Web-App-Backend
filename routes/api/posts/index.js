/**
 *
 * @author My-Anh Chau
 *
 */

const router = require('express').Router();
// IL FAUT USE POSTREPOSITORY
const userRepository = require('../../../data/PostRepository');
// ROUTE POUR AJOUTER UN POST - CREATION D'UNE PUBLICATION
router.post('/add', async (req, res) => {
  try {
    const p = req.body;
    await userRepository.insertOne(p);
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
// ROUTE POUR GET LES POSTS
router.get('/', async (req, res) => {
  try {
    const users = await userRepository.getAll(req.userId);
    return res
      .status(200)
      .json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});
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
  }
});

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

module.exports = router;
