const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purviewSchema = new Schema({
    purview_code: String,//權限代號
    description: String,//權限代號說明
    system_code_id: [{type: Schema.Types.ObjectId, ref: "system_code"}]//  系統功能代號
});

module.exports = mongoose.model("purview",  purviewSchema);