const { Router } = require('express');
const express = require('express');

const router = express.Router();

let UserRepository = new bd();

router.post('/', function (req, res) {
  res.send('post request ds homepage')
})

router.get('/', function (req, res) {
  res.send('get request ds homepage')
})

// pas sure
router.use(authorizationFunction);
router.put();
router.delete();

// logic qui revolve ds avant et apres fct

router.post('/add', (req, res) => {
  const { userInfo } = req.body; 
  // request body plutot express
  // verifie avec la documentation 

  const user = new User(userInfo);
  // get user by id
  UserRepository.add(user); // TODO

  // imp savoir de laction qui va se passer
  // return user
  res.status(201);
  //faire un si sa fail de faire un autre message derreur
  // type derreur 
});

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
