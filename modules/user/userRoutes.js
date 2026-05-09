const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');
const upload = require("../../middleware/upload");
//const adminMiddleware = require('../../middleware/adminMiddleware');
const { signup,
        login,
        uploadProfileImage,
        getUser,
        updateProfile,
        forgotPassword,
        resetPassword
        } = require('./userController');

// POST /api/users/
router.post('/signup', signup);
router.post('/login', login);
router.post('/uploadProfileImage',userMiddleware,upload.single("image"),uploadProfileImage);
router.get('/getUser',userMiddleware,getUser);
router.put('/updateProfile',userMiddleware,updateProfile);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);



module.exports = router;