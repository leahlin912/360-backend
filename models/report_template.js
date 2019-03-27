const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const report_templateSchema = new Schema({
    report_template_code: String,   //樣板代號
    file_extension:String,  //副檔名
    original_name:String    //原始檔名
});

module.exports = mongoose.model("report_template", report_templateSchema);