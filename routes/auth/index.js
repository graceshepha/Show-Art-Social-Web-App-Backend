const router = require('express').Router();

// routes
// PAS SURE CUS ON A PAS FAIT CELUI AUTH MIDDLEWARE 
/*
const login = require('../../modules/tknGen');
const { createUser, createProfile } = require('../../modules/signupBackend');
const authMiddleware = require('../../middleware/auth-middleware');

router.post('/login', login);
router.post('/create-user', createUser, login);
router.post('/create-profile', authMiddleware, createProfile);
*/

module.exports = router;
