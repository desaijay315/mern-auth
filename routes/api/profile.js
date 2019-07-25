const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { ObjectID } = require('mongodb');
const config = require('config');
const request = require('request');

// @router   GET api/profile
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  //console.log(req.user);
  // return false;
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user',
    ['name', 'avatar']
  );

  if (!profile) {
    return res.status(400).send({ msg: 'There is no profile for this user' });
  }

  return res.json(profile);
});

// @router   GET api/profile
// @desc     Create or update users profile
// @access   Private

router.post(
  '/',
  [
    auth,
    check('status', 'Status is required')
      .not()
      .isEmpty(),
    check('skills', 'Skills is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //update the profile is found
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.log(err);
      return res.status(401).send('cannot be created');
    }
  }
);

// @router   GET api/profile
// @desc     GET all profiles
// @access   Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);
  } catch (error) {
    console.log(error);
    return res.status(401).send('Error');
  }
});

// @router   GET api/profile
// @desc     GET user profiles by user id
// @access   Public

router.get('/user/:id', async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send('No profile for this user');
  }
  try {
    const profiles = await Profile.findOne({ user: req.params.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profiles) {
      return res.status(400).send('No profile for this user');
    }
    return res.json(profiles);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// @router   DELETE api/profile
// @desc     GET all profiles, users, posts
// @access   Private

router.delete('/', auth, async (req, res) => {
  try {
    //@todo remove users post

    //@remove users profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //@remove users
    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ msg: 'Users deleted' });
  } catch (error) {
    console.log(error);
    return res.status(401).send('Error');
  }
});

// @router   PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
  '/experience',
  [
    auth,
    check('title', 'Title is required')
      .not()
      .isEmpty(),
    check('company', 'Company is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.status(500).send('server error');
    }
  }
);

// @router   DELETE api/profile/experience/:id
// @desc     DELETE experience from users profile
// @access   Private

router.delete('/experience/:id', auth, async (req, res) => {
  //console.log(req.user.id);
  //return false;
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.id);

    profile.experience.splice(removeIndex, 1);

    //save the profile
    await profile.save();
    return res.json(profile);
  } catch (error) {
    console.log(error);
    return res.status(401).send('Error');
  }
});

// @router   PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
  '/education',
  [
    auth,
    check('school', 'School is required')
      .not()
      .isEmpty(),
    check('degree', 'Degree is required')
      .not()
      .isEmpty(),
    check('fieldofstudy', 'Field of study is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newExp);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.status(500).send('server error');
    }
  }
);

// @router   DELETE api/profile/education/:id
// @desc     Delete education from users profile
// @access   Private

router.delete('/education/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.id);
    profile.education.splice(removeIndex, 1);
    //save the profile
    await profile.save();
    return res.json(profile);
  } catch (error) {
    console.log(error);
    return res.status(401).send('Error');
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
