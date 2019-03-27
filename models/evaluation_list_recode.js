const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluation_list_recordSchema = new Schema({
    project_id: {type: Schema.Types.ObjectId, ref:"project"},   //專案代號id
    be_evaluated_id: {type: Schema.Types.ObjectId, ref:"employee"},     //受評人id => A人  
    evaluation_list_obj:String, //專案評核名單檔_obj
    insert_date:Date  //建立時間
});

module.exports = mongoose.model("evaluation_list_recode", evaluation_list_recordSchema);