const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluation_listSchema = new Schema({
    project_id: {type: Schema.Types.ObjectId, ref: "project"},   //專案代號id
    be_evaluated_id: {type: Schema.Types.ObjectId, ref: "employee"},     //受評人id => A人
    evaluated: [{
        evaluated_id:{type: Schema.Types.ObjectId, ref:"employee"}, // 評量人id => B人、C人、D人
        relation:String,    //關係
        evaluation_completed:{type:Boolean,default:false}    //評量完成否
    }],
    be_evaluated_completed: {type:Boolean,default:false},  //受評人評量完成否
    evaluated_all_completed: {type:Boolean,default:false},  //評量他人完成
    supervisor_check: {type: String,default: 'W'}, //主管審核狀態 => Y(已審核)/N(未審核)/P(不通過)/w(審核中)
    supervisor_opinion: String  //主管評核意見
});

module.exports = mongoose.model("evaluation_list", evaluation_listSchema);