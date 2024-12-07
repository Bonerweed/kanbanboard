const express = require("express");
const router = express.Router();
const User = require("../dbmodels/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer( {storage} );

//special secret debug pages
router.get("/steve", async (req,res)=>{
    await User.create({
        username: "wozniac",
        password: "123",
        admin: true
    }).then(res.redirect("/"));
});
router.get("/minecraft", async (req, res) => {
    const quesry = await User.find().exec();
    console.log(quesry);
    res.redirect("/");
});

router.get("/", (req, res)=>{
    //res.render("login");
    res.redirect("/user/login");
});

router.get("/login", (req, res) => {
    //check for token, if token the bugger off to boards
    //if (req.cookies["user"]) {
    if (req.session.user) {
        res.redirect("/kanban/list");
    }
    else {
        res.render("login");
    }
});

router.get("/register", (req, res) => {
    //if (req.cookies["user"]) {
    if (req.session.user) {
        res.redirect("/kanban/list");
    }
    else {
        res.render("register");
    }
});

router.post("/login", async (req, res)=>{
    console.log("GOT", req.body, req.body.username, req.body.password);
    const query = await User.find({username: req.body.username}).exec();
    if (!query) {res.status(403).json({messeage: "no name in db"})}
    //add salt fetch here
    console.log(query[0].password, req.body.password);
    if (req.body.password == query[0].password){
        console.log("welcome");
        const payload = {
            id: query[0]._id,
            username: query[0].username,
            admin: query[0].admin
        };
        console.log(payload);
        req.session.user = payload.username;
        if (payload.admin) {
            req.session.admin = payload.admin;
        }
        res.json({success: true, username: payload.username, admin: payload.admin, redirect:"/"});
        /*jwt.sign(
            payload,
            process.env.SECRET,
            {
                expiresIn: 7200
            },
            (err, token) => {
                res.json({success: true, token, username: payload.username, admin: payload.admin, redirect:"/"});
            }
        );*/
    }
    else {
        res.json({success: false, redirect:"/user"});
    }
});
  
//handle registration
router.post("/register", async (req, res) => {
    console.log("GOT", req.body, req.body.username, req.body.password1);
    const query = await User.findOne({username: req.body.username}).exec();
    console.log(query);
    /*if (err) {
        console.log(err);
        throw err
    };*/
    if (query) {
        console.log("WEEWOO");
        return res.status(403).json( {username: "Username has been taken"});
    }
    try {
        await User.create({
            username: String(req.body.username),
            password: String(req.body.password1),
            admin: false
        }).then(res.json({success: true, redirect:"/user/login"}));
    } catch(error){
        console.log(error);
    }
    //res.json({success: true, redirect:"/user/login"});
});

module.exports = router;