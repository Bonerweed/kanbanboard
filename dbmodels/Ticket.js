const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ticketSchema = new Schema({
    boardId: {type: String},
    owner: {type: String},
    title: {type: String},
    text: {type: String},
    color: {type: String}
    //board: {type: String},

});

module.exports = mongoose.model("ticket", ticketSchema);
