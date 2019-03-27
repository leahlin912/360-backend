const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    enterprise_id: {type: Schema.Types.ObjectId, ref:"enterprise"}, //企業資料檔id
    department_code: String,  //部門代號
    name: String              //部門名稱
});

module.exports = mongoose.model("department", departmentSchema);