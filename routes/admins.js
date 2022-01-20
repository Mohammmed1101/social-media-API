const { Admin , signupJoi , loginJoi } = require("../models/Admin")
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require('dotenv').config()


router.post("/signup-admin", async (req, res) => {
    try {

      //valiate 
      const result = signupJoi(req.body)
      if (result.error) return res.status(400).json(result.error.details[0].message)


      const { firstName, lastName, username, email, password, role } = req.body;
  
      let adminEmailUser = await Admin.findOne({ email });
      if (adminEmailUser) return res.status(400).send("admin already registered email taken");

      adminEmailUser = await Admin.findOne({ username });
      if (adminEmailUser) return res.status(400).send("admin already registered username taken");
        
      let hash 
      if(password){
      const salt = await bcrypt.genSalt(10);
       hash = await bcrypt.hash(password, salt);
      }
      const admin = new Admin({
        firstName,
        lastName,
        username,
        email,
        password: hash,
        role: "Admin",
      })
      await admin.save()
       res.json(admin)
      } catch(error){
        console.log(error.message)
        res.status(500).json("The problem in server")
      }
    })
//login admin
router.post("/login-admin", async (req, res) => {
    try {
        const { username , email, password } = req.body

        //validate
        const result = loginJoi(req.body)
        if (result.error) return res.status(400).json(result.error.details[0].message)

       
        const admin = await Admin.findOne({$or :[ {email} , {username} ]})
        if (!admin) return res.status(404).json("admin not registered")

        const valid = await bcrypt.compare(password, admin.password)
        if (!valid) return res.status(400).json("password is wrong")

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: "10d" })

        res.send(token)

    } catch (error) {
        console.log(error)
        res.status(500).json("The problem in server")
    }
})

    module.exports = router