//subject:上傳檔案
//create:190115
//author:陳冠穎
//npm install --save express-fileupload

const UPLOAD_PATH = require('../../config').UPLOAD_PATH;
const fs = require('fs');

//單文件上傳
let fileUpload = (req,res,next)=>{
    const { file } = req;
    fs.readFile(file.path, function(err, data) {
      fs.writeFile(`${UPLOAD_PATH}/${file.originalname}`, data, function (err) {
        if (err) res.json({ err })
        res.json({
          msg: '上傳成功'
        });
      });
    })
}

//多文件上傳
let fileUploads = (req,res,next)=>{
    const files  = req.files;
    console.log(files)
    const response = [];
    const result = new Promise((resolve, reject) => {
      files.map((v) => {
        fs.readFile(v.path, function(err, data) {
          fs.writeFile(`${UPLOAD_PATH}/${v.originalname}`, data, function(err, data) {
            const result = {
              file: v,
            }
            if (err)  reject(err);
            resolve('成功');
          })
        })
      })
    })
    result.then(r => {
      res.json({
        msg: '上傳成功',
      })
    }).catch(err => {
      res.json({ err })
    });
}

module.exports = {
    fileUpload,
    fileUploads
}
