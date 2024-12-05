const express = require("express") ;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const User = require("./dbmodels/User");


const port = process.env.PORT || 8080;
const app = express()

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");


mongoose.set("strictQuery", false);
const mongdb = "mongodb://127.0.0.1/my_database";
mongoose.connect(mongdb);

const kandb = mongoose.connection;
kandb.on("error", console.error.bind(console, "DB is DEAD, BAYBEE"));



app.get("/", (req, res) => {
    res.status(200)
    //res.send("Hello World")
    res.render("index", {title: "KabBananaman", messeage: "THIS SUCKS ON ICE"});
});

app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
});


app.listen(port, () => {
    console.log("http://localhost:8080")
});


app.get("/steve", async (req,res)=>{
    await User.create({
        username: "wozniac",
        password: "123",
        admin: true
    }).then(res.redirect("/"));
});

app.get("/minecraft", async (req, res) => {
    const quesry = await User.find({username: "wozniac"}, "username password admin id").exec();
    console.log(quesry);
    res.redirect("/");

});
