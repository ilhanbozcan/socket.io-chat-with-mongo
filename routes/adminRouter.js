const express = require('express');
let router = express.Router();
const adminController = require('../controllers/adminController.js');

const redirectLogin = (req,res,next) =>{
    if(!req.session.adminUsername){
      res.redirect('/admin');
    }
    else{
      next();
    }
  }



router
.route('/')
.get(adminController.adminLoginPageGet)


router.post('/',adminController.adminLoginPagePost);


router.get('/index',redirectLogin,adminController.adminIndexPageGet);





module.exports = router;

