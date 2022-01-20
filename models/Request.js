const mongoose = require("mongoose")
const Joi = require("joi")

const requestSchema = new mongoose.Schema({
    receive_id: {
        type:mongoose.Types.ObjectId,
        ref : "User"
    } , 
    response_id: {
        type:mongoose.Types.ObjectId,
        ref : "User"
    } 
})


const Request = mongoose.model("Request" , requestSchema )

module.exports.Request = Request
