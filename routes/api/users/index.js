const router = require('express').Router();
const { PaginationParameters } = require('mongoose-paginate-v2');
const userRepository = require('../../../data/UserRepository');
/**
 *
 * @author My-Anh Chau
 *
 */

// router.use(authMiddleware, user);
/**
 * GET /api/u/ qui retourne tous les utilisateurs avec pagination
 * @author Roger Montero
 */
router.get('/', async (req, res) => {
  try {
    const users = await userRepository.getAll(new PaginationParameters(req).getOptions());
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

// ROUTE POUR AJOUTER UN USER
router.post('/add', async (req, res) => {
  try {
    const i = req.body;
    await userRepository.insertOne(i);
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
