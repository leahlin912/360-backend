const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');

const config = require("./config/index");   //導入設定檔 只要打資料夾的名稱就會自動去抓底下的index.js所以這邊省略不打
const route = require("./routes/index");

const app = express();  //這個app使用express

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
});

app.use(morgan('dev'));//輸出日誌
app.use(bodyParser.json()); //允許json的格式
app.use(bodyParser.urlencoded({extended: false}));  //允許x-www-form-urlencoded格式
app.use("/", route);   //將ip設為defaul url

// 最後處理錯誤
app.use((err,req,res,next) => {
    return res.status(err.code || 500).send({
        errorCode: err.code,
        errorMsg: err.message
    });
});

mongoose.connect(config.mongodb).then(() => {
    app.listen(config.port, () => {     //config.port = 3000
        console.log("監聽到了" + config.port);
    });
});