const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { createProject,
        updateProject
        } = require('./projectController');


router.post('/createProject',userMiddleware, createProject);
router.put('/updateProject/:id',userMiddleware, updateProject);




module.exports = router;