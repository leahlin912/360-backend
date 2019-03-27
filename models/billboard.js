const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const billboardSchema = new Schema({
    billboard_no: Number,   //公佈欄編號
    title: String,          //公告標題
    content: String,        //公告內容
    date_start: Date,       //公告起始日
    date_end: Date          //公告截止日
});

module.exports = mongoose.model("billboard", billboardSchema);