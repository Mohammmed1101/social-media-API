const mongoose = require("mongoose")
const Joi = require("joi")

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    }],
    type: {
        type: String,
        enum: ["Public", "Private"],
        default: "Public"
    } ,   Date : {
        type : Date , 
        default : Date.now
    }
})

const postJoi = Joi.object({
    title: Joi.string().max(80),
    description: Joi.string().max(1000).required(),
    image: Joi.string().uri().allow(""),
    type : Joi.string().valid("Public", "Private")
})
const editJoi = Joi.object({
    title: Joi.string().max(80),
    description: Joi.string().max(1000),
    image: Joi.string().uri().allow(""),
    type : Joi.string().valid("Public", "Private")
})

const Post = mongoose.model("Post", postSchema)

module.exports.Post = Post
module.exports.postJoi = postJoi
module.exports.editJoi = editJoi