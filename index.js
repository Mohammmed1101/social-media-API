//import 
const express = require('express')
const mongoose = require('mongoose')
var cors = require('cors')
const app = express()
const users = require("./routes/users")
const posts = require("./routes/posts")
const conversation = require("./routes/conversation")
const messages = require("./routes/messages")
const request = require("./routes/requests")
const admins = require("./routes/admins")






//connection Database
mongoose.connect(`mongodb+srv://user1332Mood:${process.env.MONGO_PASSWORD_KEY}@cluster0.aiiku.mongodb.net/socialMediaDB?retryWrites=true&w=majority`)
  .then(() => console.log("connection"))
  .catch(error => console.log("fail connection" + error))



app.use(express.json())
app.use(cors())
app.use("/api/auth", users)
app.use("/api/posts", posts)
app.use("/api/conversation", conversation)
app.use("/api/messages", messages)
app.use("/api/request", request)
app.use("/api/admins", admins)

//server
const port = 5000
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})