const mongoose = require("mongoose")
const Joi = require("joi")
const { date } = require("joi")

const conversationSchema = new mongoose.Schema({
    sender_id : {
        type :mongoose.Types.ObjectId,
        ref : "User"
    },
    message : String ,
    receive_id : {
        type :mongoose.Types.ObjectId,
        ref : "User"
    },
    Date : {
        type : Date , 
        default : Date.now
    }

})

const conversationJoi = Joi.object({
    message : Joi.string().max(1000).required(),

})

const Conversation = mongoose.model("Conversation" , conversationSchema)

module.exports.Conversation = Conversation
module.exports.conversationJoi = conversationJoi
