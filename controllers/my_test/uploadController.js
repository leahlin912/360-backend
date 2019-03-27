const errorHandler = require("../../utils/errorHandler");
const config = require("../../config");

const uploadAvatar = (req,res,next) => {
    if(!req.file){
        next(errorHandler.FAIL);
        return;
    }else{
        //用逗點把傳進來的檔案 檔名跟副檔名分開
        let fileArr = req.file.originalname.split(".");
        //這邊概念是設計傳大頭貼的路徑用token的使用者id可以確保每個人大頭貼的網址不會衝到
        let filePath = config.urlRoot + req.decoded.userId + "." + fileArr[1];   
        //回傳要用物件的格式
        res.send({avatarPath: filePath});
    }
};

module.exports = {
    uploadAvatar
};  