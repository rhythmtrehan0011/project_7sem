const userModel=require('../models/authModel');

const signUpUser= async(req,res)=>{
    try{
    const{firstName,lastName,email,phoneNumber,password}=req.body;
        if(!firstName ||!lastName||!email||!phoneNumber||!password){    
            return res.status(400).send({message:"send all details"});    
    }

    const alreadyUser=await userModel.findOne({email});
    if(alreadyUser){
        return res.status(400).send({message:"user already exist"});
    }

    const newUser=new userModel({
        firstName,
        lastName,
        email,
        phoneNumber,
        password
    });

await newUser.save();
    
res.status(201).send({message:"user created successfully",user:newUser})
    }
    catch(err){
        console.log("error Signing Up",err)
        res.status(500).send({message:"server error"});
    }
};

module.exports={signUpUser};