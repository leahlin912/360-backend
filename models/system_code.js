const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const system_codeSchema = new Schema({
    system_code: String,//系統功能代號
    description: String //系統功能說明
});

module.exports = mongoose.model("system_code", system_codeSchema);