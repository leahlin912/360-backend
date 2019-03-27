const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const allianceSchema = new Schema({
    employee_id: {type: Schema.Types.ObjectId, ref:"employee"}, //員工代號id
    alliance_no: String,    //目標編號
    year_target: String,    //年度目標
    target_date_start: Date,//目標起始日
    target_date_end: Date,  //目標結束日
    task_items: [{type: Schema.Types.ObjectId, ref:"task"}] //任務項目id
});
module.exports = mongoose.model("alliance", allianceSchema);