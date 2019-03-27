const express = require("express");
const uploadController = require("../../controllers/my_test/uploadController");
const router = express.Router();
const multer = require("multer");

const storage = multer.dickStorage(     //插件本身提供的方法(存檔) 如果不用這個方法就不能下載到server
    {
        destination: "./uploads/",
        filename: (req,file, cb) => {
            //這兩行決定檔名
            let fileArr = file.originalname.split(".");
            cb(null, req.decoded.userId + "." + fileArr[1]);
        }
    }
);

//storage是我們宣告的公西
const upload = multer({stotage: storage});      

router.post("/avatar", upload.single("avatar"));

module.exports = router;