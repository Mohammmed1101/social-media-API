const mongoose = require("mongoose")
const Joi = require("joi")


const commentSchema = new mongoose.Schema({
    poster : {
        type : mongoose.Types.ObjectId , 
        ref : "Post"
    },
    comment : String ,
    owner : {
        type : mongoose.Types.ObjectId , 
        ref : "User"
    }
})

const commentJoi = Joi.object({
    comment : Joi.string().max(1000).required(),
})


const Comment = mongoose.model("Comment" , commentSchema)


module.exports.Comment = Comment
module.exports.commentJoi = commentJoi