const mongoose = require("mongoose");
const Shcema = mongoose.Schema

const project_emp_statusSchema = new Shcema({
    project_id: {type: Shcema.Types.ObjectId, ref:"project"},   //專案代號id
    employee_id: {type: Shcema.Types.ObjectId, ref:"employee"}, //員工代號id
    evaluation_close: String,       //完成挑選評量人選 => Y/N
    evaluation_close_date: Date,    //完成挑選評量人選日期    
    project_close: String,          //完成他人評量 => Y/N
    project_close_date: Date        //完成他人評量日期
});

module.exports = mongoose.model("project_emp_status", project_emp_statusSchema);