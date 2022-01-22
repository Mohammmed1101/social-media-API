const express = require("express")
const router = express.Router()
const { User } = require("../models/User")
const { Request } = require("../models/Request")
const jwt = require('jsonwebtoken')

//receive_id
router.get("/profile/:id/request", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId

        // console.log(req.userId)
        // console.log(req.params.id)
        if (req.params.id == req.userId) return res.status(400).json("you can not add yourself")

        const newRequest = new Request({
            sender_id: req.userId,
            receive_id: req.params.id
        })


        await newRequest.save()

        await User.findByIdAndUpdate(req.params.id, { $push: { request: newRequest._id } })
        res.json(newRequest)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The proplem in server")
    }
})
//id message
router.get("/profile/:requestId/accept", async (req, res) => {

    //check (token)
    const token = req.header("Authorization")
    if (!token) return res.status(401).json("token is missing")

    const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decryptToken.id

    const user = await User.findById(userId).select("-password")
    if (!user) return res.status(404).json("user not found")
    req.userId = userId


    const request = await Request.findByIdAndRemove(req.params.requestId)
    if (!request) return res.status(404).json("request not found")


    await User.findByIdAndUpdate(req.userId, { $addToSet: { friends: request.sender_id } })
    await User.findByIdAndUpdate(request.sender_id, { $addToSet: { friends: req.userId }, $pull: { request: request._id } })


    res.json("added friend")


})


router.get("/profile/:requestId/reject", async (req, res) => {

    //check user(token)
    const token = req.header("Authorization")
    if (!token) return res.status(401).json("token is missing")

    const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decryptToken.id

    const user = await User.findById(userId).select("-password")
    if (!user) return res.status(404).json("user not found")
    req.userId = userId


    const request = await Request.findByIdAndRemove(req.params.requestId)
    if (!request) return res.status(404).json("request not found")


    await User.findByIdAndUpdate(request.receive_id, { $pull: { request: request._id } })


    res.json("reject requested")
})
module.exports = router