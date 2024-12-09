const express = require("express");
const router = express.Router();
const Lane = require("../dbmodels/Lane");
const Ticket = require("../dbmodels/Ticket");
const Board = require("../dbmodels/Board");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer( {storage} );


router.get("/", (req, res)=>{
    res.redirect("/kanban/list");
});

//GET list users kans
router.get("/list", async (req, res)=>{
    //console.log(req.session.user);
    if (req.session.user) {
        const boards = await Board.find({owner: req.session.user}).exec();
        //console.log(boards);
        const puguser = req.session.user;
        res.render("kanlist", {boards, puguser});
    }
    else {
        res.redirect("/user/login");
    }
});

router.get("/view/:boardId", async (req, res) => {
    if (!req.session.user) {
        res.redirect("/user/login");
    }
    const queryLanes = await Lane.find({boardId: req.params.boardId}).exec();
    const _board = await Board.findOne({_id: req.params.boardId});
    if (req.session.user != _board.owner) {
        console.log("sneaky urchin!")
        res.render("index");
        return;
    }
    else {
        const puguser = req.session.user;
        res.render("kan", {boardId: req.params.boardId, lanes: queryLanes, puguser: puguser});
    }
    //const queryTics = await Ticket.find({boardId: req.params.boardId}).exec();
    //console.log(queryLanes);
    //res.json({success: true, lanes: queryLanes, tickets: queryTics, });, tickets: queryTics

});

//fetch
router.get("/view/:boardId/tics", async (req, res) => {
    //console.log("TIC REQ", req.params.boardId);
    const queryLanes = await Lane.find({boardId: req.params.boardId}).exec();
    const queryTics = await Ticket.find({boardId: req.params.boardId}).exec();
    //console.log( queryTics);
    res.json({success: true, tickets: queryTics, lanes: queryLanes});
    //res.json({success: true, lanes: queryLanes, tickets: queryTics, });

});

//POST on LIST to make new
router.post("/list", async (req, res) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        res.status(403).json({messeage: "log in"});
    }
    //console.log("GOT", req.body, req.body.username, req.body.password);
    //const query = await User.find({username: req.body.username}).exec();
    const bord = await Board.create({
        owner: req.session.user,
        title: req.body.name,
    });
    res.json({success: true, redirect:"/kanban/list"});
});


//POST list to delete
router.post("/:boardId/delete", async (req, res)=>{
    //console.log("nuking", req.params.boardId);
    const _board = await Board.findOne({_id: req.params.boardId});
    const _lanes = await Lane.find({boardId: req.params.boardId}).exec();
    const _tics = await Ticket.find({boardId: req.params.boardId}).exec();
    for (let i = 0; i < _tics.length; i++) {
        const tictodelete = await Ticket.findOne({_id: _tics[i]});
        //console.log(tictodelete);
        tictodelete.deleteOne();
        const thing = await Ticket.findOneAndDelete({_id: _tics[i]});
        //console.log("daletion comnplete?", thing);
    }
    for (let i = 0; i < _tics.length; i++) {
        const laneodelete = await Lane.findOne({_id: _lanes[i]});
        //console.log(laneodelete);
        laneodelete.deleteOne();
        const thing = await Lane.findOneAndDelete({_id: _lanes[i]});
        //console.log("daletion comnplete?", thing);
    }
    //console.log(_board);
    _board.deleteOne();
    const thing = await Board.findOneAndDelete({_id: req.params.boardId});
    //console.log("daletion comnplete?", thing);
    res.json({success: true, redirect:"/kanban/list"});
});

async function checkDeadLanes(queryLanes, lanes) {
    console.log(queryLanes.length, lanes.length);
    let orphans = [];
    for (let p = 0; p < queryLanes.length; p++) {
        //check for deleted lanes
        //pre existing lane
        console.log("LOOP", p);
        let stillImportant = false;
        for (let g = 0; g < lanes.length; g++) {
            console.log("WHEE", lanes[g].id, queryLanes[p].id);
            if (lanes[g].id == queryLanes[p].id) {
                console.log("WHEEAR");
                stillImportant = true;
            }
        }
        if (!stillImportant) {
            console.log("NORTIMPORTNAT");
            orphans = orphans.concat(queryLanes[p].tickets);
            const lanetodelete = await Lane.findOne({_id: queryLanes[p]});
            lanetodelete.deleteOne();
            const thing = await Lane.findOneAndDelete({_id: queryLanes[p]});
        }
    }
    return orphans;
}

//get save post, what a horrible amalgamation
router.post("/view/:boardId/save", async (req, res) => {
    if (!req.session.user) {
        res.redirect("/user/login");
    }
    let orphanCollector = [];
    let survivorCollector = [];
    const _board = await Board.findOne({_id: req.params.boardId});
    const queryLanes = await Lane.find({boardId: req.params.boardId}).exec();
    //console.log("SAVE REQ", req.params, req.body, _board);
    const lanes = req.body.lanes;
    const potentialOrphans = await checkDeadLanes(queryLanes, lanes);
    if (potentialOrphans.length > 0) {
        console.log("WE GOT ORPHANS");
        orphanCollector = orphanCollector.concat(potentialOrphans);
    }
    for (let i = 0; i < lanes.length; i++) {
        //console.log(lanes[i].tickets);
        const ticListUpd = [];
        for (let j = 0; j < lanes[i].tickets.length; j++) {
            const tic = lanes[i].tickets[j];
            if (tic.id.indexOf("_") == -1) {
                //existing ticket
                const ticupdate = {
                    title: tic.title,
                    text: tic.content,
                    color: tic.color
                };
                const ticup = await Ticket.findOne({_id: tic.id});
                ticup.title = tic.title;
                ticup.text = tic.content;
                ticup.color = tic.color;
                ticup.save();
                ticListUpd.push(ticup.id);
            }
            else {
                //console.log(tic.id);
                const tix = await Ticket.create({
                    boardId: _board._id,
                    owner: req.session.user,
                    title: tic.title,
                    text: tic.content,
                    color: tic.color
                });
                ticListUpd.push(tix.id);
            }
        }
        //update ticket list, delete missing ones.
        let laneup = undefined;
        if (lanes[i].id.indexOf("_") != -1) {
            const newLane = await Lane.create({
                boardId: _board._id,
                owner: req.session.user,
                title: lanes[i].title,
                tickets: [],
                color: ""
            });
            //console.log(newLane);
            laneup = await Lane.findOne({_id: newLane.id});
        }
        else {
            laneup = await Lane.findOne({_id: lanes[i].id});
        }
        const OldTickets = laneup.tickets;
        laneup.tickets = ticListUpd;
        laneup.save();
        survivorCollector = survivorCollector.concat(ticListUpd);
        for (let h = 0; h < OldTickets.length; h++) {
            let included = false;
            for (let k = 0; k < ticListUpd.length; k++) {
                if (OldTickets[h] == ticListUpd[k]) {
                    included = true;
                    break;
                }
            }
            if (!included) {
                console.log("ARGH");
                orphanCollector.push(OldTickets[h]);
                //const tictodelete = await Ticket.findOne({_id: OldTickets[h]});
                //tictodelete.deleteOne();
                //const thing = await Ticket.findOneAndDelete({_id: OldTickets[h]});
            }
        }
        
    }
    await orphanCrusher(orphanCollector, survivorCollector, req.session.user);
    res.json({success: true, redirect: `/kanban/view/${req.params.boardId}`});
});

async function orphanCrusher(orphans, survivors, user) {
    /*const remainingLanes = await Lane.find({owner: user}).exec();
    console.log(remainingLanes);
    let survivors = [];
    for (let i = 0; i < remainingLanes.length; i++) {
        survivors = survivors.concat(remainingLanes[i].tickets);
    }
    console.log(survivors, orphans);*/
    const trueOrphans = orphans.filter(orphan => !survivors.includes(orphan));
    console.log(trueOrphans, orphans, survivors);
    for (let i = 0; i < trueOrphans.length; i++) {
        const tictodelete = await Ticket.findOne({_id: trueOrphans[i]});
        tictodelete.deleteOne();
        const thing = await Ticket.findOneAndDelete({_id: trueOrphans[i]});
    }
}

/*async function deepRemove(lane, user) {
    const ticketList = lane.tickets;
    for (let i = 0; i < ticketList.length; i++) {
        const tictodelete = await Ticket.findOne({_id: ticketList[i]});
        //console.log(tictodelete);
        //tictodelete.deleteOne();
        //const thing = await Ticket.findOneAndDelete({_id: ticketList[i]});
        //console.log("daletion comnplete?", thing);
    }
}*/
//GET show kan
/*router.get("/:kanid", (req, res) => {
    if (req.session.user) {
        //res.render("kanlist");
        res.redirect("/");
    }
    else {
        res.redirect("/user/login");
    }
});*/


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
    for (let i = 0; i < 1; i++) {
        let bordid = boardList[0].id;
        if (i == 2 || i == 3) {
            bordid = boardList[0].id;
        }
        const tix = await Ticket.create({
            boardId: bordid,
            owner: "wozniac",
            title: "COOL TICKET " + i.toString(),
            text: "TRIM MY FAT BEARD",
            color: "white"
        });
        ticketList.push(tix);
    }

    //create mock lanes
    for (let i = 0; i < 1; i++) {
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
            color: "white"
        });
    }
    res.redirect("/");
});

router.get("/ohman", async (req, res)=>{
    console.log("aww man");
    const quesero = await Board.find().exec();
    console.log(quesero);
    const quesry = await Lane.find().exec();
    console.log(quesry);
    const questwo = await Ticket.find().exec();
    console.log(questwo);
    res.redirect("/");
});

module.exports = router;