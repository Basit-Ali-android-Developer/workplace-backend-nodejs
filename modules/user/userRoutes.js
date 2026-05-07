const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/userMiddleware');
//const adminMiddleware = require('../../middleware/adminMiddleware');
const { signup,
        login
        } = require('./userController');

// POST /api/users/
router.post('/signup', signup);
router.post('/login', login);



module.exports = router;