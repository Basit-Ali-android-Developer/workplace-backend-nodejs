const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { createProject,
        updateProject,
        updateProjectStatus
        } = require('./projectController');


router.post('/createProject',userMiddleware, createProject);
router.put('/updateProject/:id',userMiddleware, updateProject);
router.put('/updateProjectStatus/:id',userMiddleware, updateProjectStatus);




module.exports = router;