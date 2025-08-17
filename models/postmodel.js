const mongoose = require("mongoose");

const commentschema = new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        text:{type:String,required:true},
    },
    {timestamps:true}
);

const postSchema = new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        title:{type:String,required:true},
        content:{type:String,required:true},
        comments:[commentSchema],
    },
    {timestamps:true}
);

module.exports = mongoose.model("Post",postSchema);