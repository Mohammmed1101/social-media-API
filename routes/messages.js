const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { Message } = require("../models/Message")
const { User } = require("../models/User")


router.post("/profile/:id/message", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId

        const { message } = req.body
        const newMessage = new Message({
            message,
            poster_id: req.userId,
            receive_id: req.params.id
        })
        await newMessage.save()

        await User.findByIdAndUpdate(req.userId, { $push: { sent: newMessage._id } })
        await User.findByIdAndUpdate(req.params.id, { $push: { receive: newMessage._id } })

        res.json(newMessage)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The proplem in server")
    }
})

//favourite 
router.get("/profile/:id/favourite", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId

        //check(validate) id
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid object id")

        let message = await Message.findById(req.params.id)
        if (!message) return res.status(404).json("message not found")

        const userFound = user.favourite.find(favourite => favourite == req.params.id)
        if (userFound) {
            await User.findByIdAndUpdate(req.userId, { $pull: { favourite: req.params.id } })
            res.json("remove favourite")
        } else {
            await User.findByIdAndUpdate(req.userId, { $addToSet: { favourite: req.params.id } })
            res.json("favourite")
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

module.exports = router;