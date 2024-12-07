const express = require("express") ;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const bp = require("body-parser");
const User = require("./routes/user");
const Kanban = require("./routes/kanban");
const multer = require("multer");
const multInst = multer();
const session = require('express-session');
const cookieParser = require('cookie-parser');


//express setup
const port = process.env.PORT || 8080;
const app = express()

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(express.json());
app.use(multInst.array()); 
app.use(cookieParser());
app.use(session({secret: "ItsDangerousToGoAloneTakeThis!"}));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")));


//routers
//app.use("/", index);
app.use("/kanban", Kanban);
app.use("/user", User);

//mongo

mongoose.set("strictQuery", false);
const mongdb = "mongodb://127.0.0.1/my_database";
mongoose.connect(mongdb);

const kandb = mongoose.connection;
kandb.on("error", console.error.bind(console, "DB is DEAD, BAYBEE"));



app.get("/", (req, res) => {
    res.status(200)
    //res.send("Hello World")
    res.render("kan", {title: "KabBananaman", messeage: "THIS SUCKS ON ICE"});
});

app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
});


app.listen(port, () => {
    console.log("http://localhost:8080")
});
