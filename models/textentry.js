const mongoose = require("mongoose");

const textentryschema  = new mongoose.Schema(
    {
        title:{
            type :String,
            trim : true,
            maxlength:100,
        },
        body:{
           type:String,
          // required:true,
        },
        author:{
            type:String,
            enum:["draft","published"],
            default:"draft",
        },
        versions:
        [{
            body:String,
            savedAt:{type:Date,default:Date.now},
        },
    ],
    },
    {timestamps:true}
);

module.exports = mongoose.model("textentry",textentryschema);