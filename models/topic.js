const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema({
    topic_code: String, //題目編號
    applicable_dep_id: {type: Schema.Types.ObjectId, ref: "department"},   //題目適用部門 => 全公司(為null值)、個別部門(部門代號)
    ability_id: {type: Schema.Types.ObjectId, ref: "ability"},   //題目類型說明/受評能力
    type: Number,       //題目類型/題型 => 1.問答 2.分數 3.選擇
    content: String,    //題目內容/問題描述
    option: [String]     //選擇題選項/選項描述 => Schema Array裡面要給type    
});

module.exports = mongoose.model("topic", topicSchema);