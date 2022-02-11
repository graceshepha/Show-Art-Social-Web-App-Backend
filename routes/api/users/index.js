/**
 * 
 * @author My-Anh Chau            
 * 
 */

/*
const { Router } = require('express');
const express = require('express');
const router = express.Router();      
*/

const router = require('express').Router();

const userRepository = require('../../../data/UserRepository');

// router.use(authMiddleware, user);

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
    res
      .status(400)
      .json({ status: 400, message: 'Internal Server Error' });
  }
});
// logic qui revolve ds avant et apres fct

/*
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
