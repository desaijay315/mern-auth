const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');
const { ObjectID } = require('mongodb');

// @router   POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  [
    auth,
    check('text', 'Text is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // console.log(req.user.id);
    try {
      const user = await User.findById(req.user.id);
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      return res.json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).send('Server Error');
    }
  }
);

// @router   GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// @router   GET api/posts
// @desc     Get all posts by id
// @access   Private
router.get('/:id', auth, async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send('No post for this id');
  }
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).send('No post for this id');
    }
    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// @router   GET api/posts
// @desc     Delete  posts by id
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send('No post for this id');
  }
  try {
    const posts = await Post.findById(req.params.id);

    if (posts.user.toString() !== req.user.id) {
      return res.status(401).send('Unauthorized access!');
    }
    if (!posts) {
      return res.status(404).send('No post for this id');
    }
    await posts.remove();
    return res.json({ msg: 'Post Removed' });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
