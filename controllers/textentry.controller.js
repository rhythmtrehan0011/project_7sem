const { text } = require("express");
const textentry = require("../models/textentry");

exports.createtextentry = async(req , res)=>{
    try{
        const entry = await textentry.create(req.body);
        res.status(201).json(entry);
    }catch(err){
        res.status(400).json({error:err.message});
    }
};

exports.getalltextentry = async(req , res)=>{
    try{
       const entries = await textentry.find();
       res.json(entries);
    }catch(err){
        res.status(500).json({err:err.message});
    }
};

exports.gettextentry = async (req ,res)=>{
    try{
         const entry = await  textentry.findById(req.params.id);
         if(!entry) return res.status(404).json({error:"Not found"});
         res.json(entry);
    }catch(err){
        res.status(500).json({error:err.message});
    }
};
 

exports.updatetextentry = async (req , res)=>{
    try{
     const entry  = await textentry.findById(req.params.id);
     if(!entry) return res.status(404).json({error:"Not found"});
     if(req.body.body){
        entry.versions.push({body:entry.body});
     }
     Object.assign(entry,req.body);
     await entry.save();
     res.json(entry);
    }catch(err){
      res.status(400).json({error:err.message});
    }
};

exports.deletetextentry = async (req , res)=>{
    try{
      await textentry.findByIdAndDelete(req.params.id);
      res.json({message:"Deleted successfully"});
    }catch(err){
        res.status(500).json({error:err.message});
    }
};