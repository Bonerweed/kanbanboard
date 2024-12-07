const express = require("express");
const router = express.Router();
const Lane = require("../dbmodels/Lane");
const Ticket = require("../dbmodels/Ticket");
const Board = require("../dbmodels/Board");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer( {storage} );


//GET list users kans
router.get("/list", async (req, res)=>{
    console.log(req.session.user);
    if (req.session.user) {
        const boards = await Board.find({owner: req.session.user}).exec();
        console.log(boards);
        res.render("kanlist", {boards});
    }
    else {
        res.redirect("/user/login");
    }
});

//GET show kan
router.get("/:kanid", (req, res) => {
    if (req.session.user) {
        //res.render("kanlist");
        res.redirect("/");
    }
    else {
        res.redirect("/user/login");
    }
});


//special populate call
router.get("/creeper", async (req, res) => {
    const ticketList = [];
    const boardList = [];
    let ticketTracker = 0;

    //create mock boards
    for (let i = 0; i < 2; i++) {
        const bord = await Board.create({
            owner: "wozniac",
            title: "COOL BOARD " + i.toString(),
        });
        boardList.push(bord);
    }
    //create mock tickets
    for (let i = 0; i < 5; i++) {
        let bordid = boardList[0].id;
        if (i == 2 || i == 3) {
            bordid = boardList[0].id;
        }
        const tix = await Ticket.create({
            boardId: bordid,
            owner: "wozniac",
            title: "COOL TICKET " + i.toString(),
            text: "TRIM MY FAT BEARD",
            color: "#0F13A5"
        });
        ticketList.push(tix);
    }

    //create mock lanes
    for (let i = 0; i < 3; i++) {
        let bordid = boardList[0].id;
        if (i == 2) {
            bordid = boardList[0].id;
        }
        const list = [];
        if (ticketTracker + 1 <= ticketList.length-1){
            list.push(ticketList[ticketTracker].id);
            ticketTracker++;
            list.push(ticketList[ticketTracker].id);
            ticketTracker++;
        }
        else if (ticketTracker <= ticketList.length-1) {
            list.push(ticketList[ticketTracker].id);
            ticketTracker++;
        }
        await Lane.create({
            boardId: bordid,
            owner: "wozniac",
            title: "COOL LANE " + i.toString(),
            tickets: list,
            color: "#f8f8f8"
        });
    }
    res.redirect("/");
});

router.get("/ohman", async (req, res)=>{
    const quesero = await Board.find().exec();
    console.log(quesero);
    const quesry = await Lane.find().exec();
    console.log(quesry);
    const questwo = await Ticket.find().exec();
    console.log(questwo);
    res.redirect("/");
});

module.exports = router;