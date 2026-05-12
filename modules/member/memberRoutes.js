const express = require('express');
const router = express.Router();
const userMiddleware = require('../../middleware/userMiddleware');


const { addMember
      
        } = require('./memberController');


router.post('/addMember/:id',userMiddleware, addMember);





module.exports = router;