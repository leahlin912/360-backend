const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pro_topic_resSchema = new Schema({
    project_id: {type: Schema.Types.ObjectId, ref:"project"},   //專案代號id
    be_evaluated_id: {type: Schema.Types.ObjectId, ref:"employee"},   //受評人id => A人
    evaluated_id: {type: Schema.Types.ObjectId, ref:"employee"},      //評量人id => B人    
    result_anonymous:Boolean,   //回答匿名否
    topic: [{
            topic_id: {type: Schema.Types.ObjectId, ref:"topic"},    //題目編號id
            topic_res: String,  //題目回應
            topic_score: {type:Number, default:0}//題目分數 
    }],
    suggest:String  //同事建議內容
});
module.exports = mongoose.model("pro_topic_res", pro_topic_resSchema);