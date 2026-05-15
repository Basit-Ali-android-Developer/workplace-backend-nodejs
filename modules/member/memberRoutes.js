const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { addMember,
        removeMember
      
        } = require('./memberController');


router.post('/addMember/:id',userMiddleware, addMember);
router.delete('/removeMember/:id',userMiddleware, removeMember);







module.exports = router;