const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

router.get('/me', getProfile);
router.post('/update', updateProfile);

module.exports = router;
