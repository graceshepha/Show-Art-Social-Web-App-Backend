const express = require('express');
const users = require('./u');
const posts = require('./p');

const router = express.Router();

// routes
router.use('/u', users);
router.use('/p', posts);

module.exports = router;
