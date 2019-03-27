const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: String,           //專案名稱
    evaluation_date_start: String,    //啟動挑選評量人起始日
    evaluation_date_end: String,      //啟動挑選評量人截止日
    project_date_start: String,       //員工互評起始日
    project_date_end: String,         //員工互評到期日
    topic_id: [{type: Schema.Types.ObjectId, ref: "topic"}],      //專案題目編號  => 一個Array的[ObjectId]
    close: String,          //專案結案否 => Y/N
    report_template_id: {type: Schema.Types.ObjectId, ref: "report_template"}   //專案樣板id 
});

module.exports = mongoose.model("project", projectSchema);