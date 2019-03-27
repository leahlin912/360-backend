const mongoose = require("mongoose");   //在這一層把mongooseimport進來
const Schema = mongoose.Schema;         //宣告一個Schema的變數用來存Schema

const employeeSchema = new Schema({     //設計Schema
    enterprise_id: {type: Schema.Types.ObjectId, ref:"enterprise"},//企業資料檔id
    department_id: {type: Schema.Types.ObjectId, ref:"department"},//部門代號id
    account: String,        //帳號
    password: String,       //帳號密碼
    job_no: String,         //工號
    name: String,           //姓名
    position: Number,       //職位 => 1.員工 2.主管
    job_title: String,      //職稱
    supervisor_id: {type: Schema.Types.ObjectId, ref:"employee"},//主管id
    situation: String,      //是否在職  Y/N
    due_date: Date,         //到職日
    res_date: Date,         //離職日
    phone_number: String,   //手機號碼
    address: String,        //地址
    email: String,          //信箱
    purview:{type: Schema.Types.ObjectId, ref:"purview"}  //權限

});

module.exports = mongoose.model("employee", employeeSchema);    //最後在export mongoose的model 把剛剛設計好的Schema放進去