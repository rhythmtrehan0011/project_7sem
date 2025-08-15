const express=require ('express');
const{signUpUser}=require('../controller/authController');
const{signInUser}=require('../controller/authController')
const router=express.Router();
router.post('/signup',signUpUser);
router.post('/signin',signInUser);
module.exports=router;
