const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let laneSchema = new Schema({
    boardId: {type: String},
    owner: {type: String},
    title: {type: String},
    tickets: [],
    color: {type: String}

});

module.exports = mongoose.model("lane", laneSchema);
