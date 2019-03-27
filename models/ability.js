const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ability = new Schema({
    ability: String
});

module.exports = mongoose.model("ability", ability);