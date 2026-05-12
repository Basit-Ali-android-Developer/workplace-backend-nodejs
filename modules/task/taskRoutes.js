const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { createTask,
    getTaskById,
    getTasksByProject,
    deleteTask,
    startTask,
    stopTask,
    completeTask,
    updateTask,
    getMyActiveTasks
        
        } = require('./taskController');


router.post('/createTask',userMiddleware, createTask);
router.get('/getTaskById/:id',userMiddleware, getTaskById);
router.get('/getTasksByProject/:id',userMiddleware, getTasksByProject);
router.delete('/deleteTask/:id',userMiddleware, deleteTask);
router.put('/updateTask/:id',userMiddleware,updateTask);

router.post('/startTask/:id',userMiddleware,startTask);
router.post('/stopTask/:id',userMiddleware,stopTask);
router.post('/completeTask/:id',userMiddleware,completeTask);

router.get('/getMyActiveTasks',userMiddleware, getMyActiveTasks);




module.exports = router;