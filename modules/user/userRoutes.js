const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');
const upload = require("../../middleware/upload");
//const adminMiddleware = require('../../middleware/adminMiddleware');
const { signup,
        login,
        uploadProfileImage,
        getUser
        } = require('./userController');

// POST /api/users/
router.post('/signup', signup);
router.post('/login', login);
router.post('/uploadProfileImage',userMiddleware,upload.single("image"),uploadProfileImage);
router.get('/getUser',userMiddleware,getUser);



module.exports = router;