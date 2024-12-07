const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let boardSchema = new Schema({
    owner: {type: String},
    title: {type: String}
});

module.exports = mongoose.model("board", boardSchema);