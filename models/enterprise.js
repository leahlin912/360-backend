const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enterpriseSchema = new Schema({
    account: String,    //企業帳號
    password: String,   //帳號密碼
    name: String,       //企業名稱
    full_name: String,  //企業全稱
    tax_no: String      //統一編號
});

module.exports = mongoose.model("enterprise", enterpriseSchema);