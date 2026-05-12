const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { createProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        getProjectById,
        getUsersProject
        } = require('./projectController');


router.post('/createProject',userMiddleware, createProject);
router.put('/updateProject/:id',userMiddleware, updateProject);
router.put('/updateProjectStatus/:id',userMiddleware, updateProjectStatus);
router.delete('/deleteProject/:id',userMiddleware, deleteProject);

router.get('/getProjectById/:id',userMiddleware, getProjectById);
router.get('/getUsersProject',userMiddleware, getUsersProject);




module.exports = router;