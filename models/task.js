const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tackSchema = new Schema({
    employee_id: {type: Schema.Types.ObjectId, ref:"employee"}, //員工代號id
    task_no: String,    //任務編號
    task_title: String, //任務標題
    task_des: String,   //任務描述
    task_achieving_rate: Number,    //任務達成率
    task_number: Number,    //任務分數
    task_review: Number     //任務review
});

module.exports = mongoose.model("tack", tackSchema);