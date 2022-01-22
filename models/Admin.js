const mongoose = require("mongoose")
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")

const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    avatar : String,
    username: String,
    email: String,
    password: String,
    role: {
    type: String,
    default: "Admin"
    }
})

const signupJoi= (input) => Joi.object({
    firstName : Joi.string().regex(/^[,. a-zA-Z]+$/).alphanum().min(3).max(50).required(),
    lastName : Joi.string().regex(/^[,. a-zA-Z]+$/).alphanum().min(3).max(50).required(),
    avatar : Joi.string().dataUri().max(1000),
    username : Joi.string().min(4).max(25).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 2,
      })
}).validate(input)

const loginJoi =  (input) => Joi.object({
    username : Joi.string().min(4).max(25),
    email: Joi.string().email(),
    password:passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 2,
      })
}).validate(input)

const Admin = mongoose.model("Admin" , adminSchema)

module.exports.Admin = Admin
module.exports.signupJoi = signupJoi
module.exports.loginJoi = loginJoi