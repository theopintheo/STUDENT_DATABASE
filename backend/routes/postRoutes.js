const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// GET all posts
router.get('/', postController.getAllPosts);

// ADD a post
router.post('/', postController.createPost);

// DELETE a post
router.delete('/:id', postController.deletePost);

module.exports = router;
