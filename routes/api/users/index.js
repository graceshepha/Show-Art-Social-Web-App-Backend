const express = require('express');

const router = express.Router();

// routes
/*
example
router.post('/add', (req, res) => {
  const { userInfo } = req.body;

  const user = new User(userInfo);
  // get user by id
  UserRepository.add(user); // TODO

  // return user
  res.status(201);
});
*/

module.exports = router;
