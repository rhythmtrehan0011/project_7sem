const express = require("express");
const passport = require("passport");
const {Post}= require("../controllers/postcontroller");

const app = express.Router();

app.get("/",async (req,res)=>{
      try{
        const posts = await Post.find()
        .populate("author","firstname lastname email")
        .populate("comments.user","firstname lastname email")
        .sort({createdAt:-1});
         res.status(200).json({ success: true, data: posts });
      }catch(err){
           console.error(err);
           res.send("request not found");
      }
});

app.post("/",passport.authenticate("jwt",{session:false}),async(req,res)=>{
    try{
const { body } = req.body;
    if (!body) {
    return res.status(400).json({ message: "All fields required", success: false });
    }
    const post = new Post({author:req.user.id,body});
    await post.save();
    res.status(201).json({message:"Post created", success:true , data:post});
    }catch(err){
        console.log(err);
        res.send("can not send data try in a few minutes!!!");
    }
});

app.put("/:id",passport.authenticate("jwt",{session:false}),async(req,res)=>{
                try{
                    const {id} = req.params;
                  
                    const { title, content, body } = req.body;
                    
                    const post = await Post.findOne({ _id: id, author: req.user.id });
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    if(title)post.title = title;
    if(content)post.content = content;
    if(body)post.body = body;
    await post.save();
    res.status(200).json({message:"Post updated ",success:true,data:post});
                }catch(err){
                  console.log(err);
                  res.send("cannot update right now ");
                }
});

app.delete("/:id",passport.authenticate("jwt",{session:false}),async(req,res)=>{
           try{

            const { id } = req.params;
    const post = await Post.findOneAndDelete({ _id: id, author: req.user.id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or not authorized", success: false });
    }
    res.status(200).json({ message: "Post deleted", success: true });

           }catch(err){
            console.log(err);
             res.send("unable to delete ");
           }
});

app.post("/:id/comment",passport.authenticate("jwt",{session:false}),async (req,res)=>{
       try{
          const {id}  = req.params;     
          const {text} = req.body;
          if(!text) return res.status(400).json( {message:"comment can not be empty",success:false});
          const post = await Post.findById(id);
          if (!post) return res.status(404).json({ message: "Post not found", success: false });

          post.comments.push({user:req.user.id,text});
          await post.save();
           res.status(200).json({ message: "Comment added", success: true, data: post });
       }catch(err){
        console.log(err);
        res.send("unable to comment");
       }
});

module.exports = app;