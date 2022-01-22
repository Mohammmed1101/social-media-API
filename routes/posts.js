const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const { commentJoi } = require("../models/Comment")
const { Post, postJoi, editJoi } = require("../models/Post")
const { User } = require("../models/User")
const { Comment } = require("../models/Comment")
const router = express.Router()



router.get("/posts/Private", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId

        const posts = await Post.find({ type: "Private" }).sort("-Date").populate("likes").populate("owner").populate({
            path: "comments",
            populate: {
                path: "owner",
            },
        })
        const privatePost = posts.filter(post => post.owner._id == req.userId || post.owner.followers.includes(req.userId) && post.owner.following.includes(req.userId))
        res.json(privatePost)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

router.get("/posts/Public", async (req, res) => {
    try {


        const posts = await Post.find({ type: "Public" }).sort("-Date").populate("likes").populate("owner").populate({
            path: "comments",
            populate: {
                path: "owner",
            },
        })
        res.json(posts)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

router.get("/:id", async (req, res) => {
    try {
        //check id
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid")


        const post = await Post.findById(req.params.id).populate({
            path: "likes",
            populate: {
                path: "username"
            }
        }).populate("owner").populate("comments").populate({
            path: "comments",
            populate: {
                path: "owner",
            },
        })
        if (!post) return res.status(404).json("post is not found")

        res.json(post)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

router.post("/", async (req, res) => {
    try {
        const { description, image, type } = req.body

        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId

        const result = postJoi.validate(req.body)
        if (result.error) return res.status(404).json(result.error.details[0].message)

        const post = new Post({

            description,
            image,
            owner: req.userId,
            type,
        })


        await User.findByIdAndUpdate(req.userId, { $push: { posts: post._id } })


        await post.save()
        res.json(post)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

router.put("/:id", async (req, res) => {
    try {
        const { title, description, image, type } = req.body

        //check id
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid")
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id


        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId


        //validate
        const result = editJoi.validate(req.body)
        if (result.error) return res.status(404).json(result.error.details[0].message)

        //edit
        const post = await Post.findByIdAndUpdate
            (req.params.id,
                { $set: { title, description, image, type } },
                { new: true })

        if (!post) return res.status(404).json("post not found")
        if (post.owner != req.userId) return res.status(403).json("Unauthorized action")
        res.json(post)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

router.delete("/:id", async (req, res) => {
    try {

        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")
        req.userId = userId


        //check id
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid")

        await Comment.deleteMany({ postId: req.params.id })
        const post = await Post.findByIdAndRemove(req.params.id)
        if (!post) return res.status(404).json("post not found")
        if (post.owner != req.userId) return res.status(403).json("Unauthorized action")

        await User.findByIdAndUpdate(req.userId, { $pull: { posts: post._id } })

        res.json(post)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})

//Likes
router.get("/:postId/likes", async (req, res) => {
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
        const id = req.params.postId
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid object id")


        let post = await Post.findById(req.params.postId)
        if (!post) return res.status(404).json("post not found")

        const userFound = post.likes.find(like => like == req.userId)
        if (userFound) {
            await Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.userId } })
            await User.findByIdAndUpdate(req.userId, { $pull: { like: req.params.postId } })
            res.json("remove like")
        } else {
            await Post.findByIdAndUpdate(req.params.postId, { $push: { likes: req.userId } })
            await User.findByIdAndUpdate(req.userId, { $push: { like: req.params.postId } })
            res.json("liked post")
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})
//comment
router.get("/:postId/comments", async (req, res) => {
    try {
        //check(validate) id
        const id = req.params.postId
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid object id")

        const post = await Post.findById(req.params.postId)
        if (!post) return res.status(404).json("post not found")

        const comments = await Comment.find({ postId: req.params.postId }).populate("owner")
        res.json(comments)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})
router.post("/:postId/comments", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id
        req.userId = userId


        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")


        //check(validate) id
        const id = req.params.postId
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("The path is not valid object id")

        let post = await Post.findById(req.params._id)
        if (post) return res.status(404).json("post not found")

        //validate
        const result = commentJoi.validate(req.body)
        if (result.error) return res.status(404).json(result.error.details[0].message)

        //requset body comment
        const { comment } = req.body

        //create comment 
        const newComment = new Comment({ comment, owner: req.userId, poster: req.params.postId })
        await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: newComment._id } })

        await User.findByIdAndUpdate(req.userId, { $push: { comments: newComment._id } })



        await newComment.save()
        res.json(newComment)

    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})
router.put("/:postId/comments/commentId", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")

        let post = await Post.findById(req.params._id)
        if (post) return res.status(404).json("post not found")

        //check(validate) id
        const postId = req.params.postId
        if (!mongoose.Types.ObjectId.isValid(postId))
            return res.status(400).send("The path is not valid object id")

        //check(validate) id
        const commentId = req.params.commentId
        if (!mongoose.Types.ObjectId.isValid(commentId))
            return res.status(400).send("The path is not valid object id")

        //validate
        const result = commentJoi.validate(req.body)
        if (result.error) return res.status(404).json(result.error.details[0].message)



        const { comment } = req.body
        const commentFound = await Comment.findById(req.params._id)
        if (!commentFound) return res.status(404).json("comment not found")
        if (commentFound.owner != req.userId) return res.status(403).json("Unauthorized action")

        const updateComment = await Comment.findByIdAndUpdate(req.params.commentId, { $set: { comment } }, { new: true })
        await updateComment.save()
        res.json(updateComment)


    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})
router.delete("/:postId/comments/:commentId", async (req, res) => {
    try {
        //check token
        const token = req.header("Authorization")
        if (!token) return res.status(401).json("token is missing")

        const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const userId = decryptToken.id
        req.userId = userId

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(404).json("user not found")

        //check id
        const postId = req.params.postId
        if (!mongoose.Types.ObjectId.isValid(postId))
            return res.status(400).send("The path is not valid object id")

        //check id
        const commentId = req.params.commentId
        if (!mongoose.Types.ObjectId.isValid(commentId))
            return res.status(400).send("The path is not valid object id")

        let post = await Post.findById(req.params._id)
        if (post) return res.status(404).json("post not found")




        const commentFound = await Comment.findById(req.params.commentId)
        if (!commentFound) return res.status(404).json("comment not found")


        if (commentFound.owner != req.userId) return res.status(403).json("unauthorized action")
        await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: commentFound._id } })
        await Comment.findByIdAndRemove(req.params.commentId)
        res.json("comment deleted")
    } catch (error) {
        console.log(error.message)
        res.status(500).json("The problem in server")
    }
})
module.exports = router