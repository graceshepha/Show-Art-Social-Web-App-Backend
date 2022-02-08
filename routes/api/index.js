const express = require('express');
const users = require('./users');
const posts = require('./posts');

const router = express.Router();

// routes
router.use('/u', users);
router.use('/p', posts);

module.exports = router;
