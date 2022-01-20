const mongoose = require("mongoose")
const Joi = require("joi")

const messageSchema = new mongoose.Schema({
    poster_id : {
        type :mongoose.Types.ObjectId,
        ref : "User"
    },
    message : String ,
    receive_id : {
        type :mongoose.Types.ObjectId,
        ref : "User"
    }
})

const messageJoi = (input) => Joi.object({
    message : Joi.string().max(1000).required(),
}).validate(input)

const Message = mongoose.model("Message" , messageSchema)

module.exports.Message = Message
module.exports.messageJoi = messageJoi
