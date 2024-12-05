const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
    username: {type: String},
    password: {type: String},
    admin: {type: Boolean}

});

module.exports = mongoose.model("users", userSchema);
