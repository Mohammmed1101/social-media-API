const mongoose  = require("mongoose")
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")



const userSchema = new mongoose.Schema({
    firstName: String,
    lastName:String,
    avatar : {
     type :   String,
     default : "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.fote.org.uk%2Fwp-content%2Fuploads%2F2017%2F03%2Fprofile-icon.png&f=1&nofb=1"
    },
    username : String , 
    email:String , 
    emailVerified : {
        type  : Boolean , 
        default : false,
    }, 
    password:String,
    comments : [{
        type : mongoose.Types.ObjectId , 
        ref : "Comment"
    }] , 
    receive : [{
        type : mongoose.Types.ObjectId,
        ref : "Message"
    }] , 
    sent : [{
        type : mongoose.Types.ObjectId,
        ref : "Message"
    }],
    favourite : [{
        type : mongoose.Types.ObjectId,
        ref : "Message"
    }],
    like : [{
        type : mongoose.Types.ObjectId,
        ref : "Post" ,
    }],
    posts : [{
        type : mongoose.Types.ObjectId,
        ref : "Post" ,
    }],
    following :[{
        type :mongoose.Types.ObjectId,
        ref : "User"
    }] , 
    followers : [{
        type : mongoose.Types.ObjectId,
        ref : "User"
    }] ,
    friends : [{
        type : mongoose.Types.ObjectId,
        ref : "User"
    }] ,
    request : [{
        type : mongoose.Types.ObjectId,
        ref : "Request"
    }]

}) 


const signupJoi= (input) => Joi.object({
    firstName : Joi.string().regex(/^[a-zA-Z]+$/).alphanum().min(3).max(50).required(),
    lastName : Joi.string().regex(/^[a-zA-Z]+$/).alphanum().min(3).max(50).required(),
    username : Joi.string().regex(/^[a-zA-Z0-9._]+$/).min(4).max(25).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 3,
      })
}).validate(input)


const loginJoi =  (input) => Joi.object({
    username : Joi.string().regex(/^[a-zA-Z0-9._]+$/).min(4).max(25),
    email: Joi.string().email(),
    password: passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 3,
      })
}).validate(input)

const resetPassJoi= (input) => Joi.object({
    username : Joi.string().regex(/^[_.a-zA-Z0-9]+$/).min(4).max(25),
    email: Joi.string().email(),
}).validate(input)

const profileJoi= (input) => Joi.object({
    firstName : Joi.string().alphanum().min(3).max(50),
    lastName : Joi.string().alphanum().min(3).max(50),
    avatar : Joi.string().uri().max(1000),
    username : Joi.string().regex(/^[a-zA-Z0-9._]+$/).min(4).max(25),
    email: Joi.string().email(),
    password: passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 3,
      })
}).validate(input)

const User = mongoose.model("User" , userSchema)

module.exports.User = User
module.exports.signupJoi = signupJoi
module.exports.loginJoi = loginJoi
module.exports.profileJoi = profileJoi
module.exports.resetPassJoi = resetPassJoi


