const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const setupTestData = require('../controllers/setupTestData');
const setupTestDataFor2018 = require('../controllers/setupTestDataFor2018');

router.get("/", mainController.home);
router.get("/test", mainController.test);
router.get("/sendTestEmail", mainController.sendTestEmail); //發送mail測試
router.get("/setupTestData", setupTestData.addSetupTestData); //建立測試資料
router.get("/setupTestDataFor2018", setupTestDataFor2018.addSetupTestData); //建立demo專案測試資料

//-------upload test---------
const multer  = require('multer');
const upload = multer({ dest: require('../config/index').UPLOAD_PATH })
const uploadTemplate = multer({ dest: require('../config/index').TEMPLATE_PATH })
const uploadFunc = require('../controllers/system/uploadController');
const html_upload = "<form action=\"/upload\" method=\"post\" enctype=\"multipart/form-data\">"+
        "<input name=\"fileUpload\" type=\"file\" />"+
        "<img src=\"\" alt=\"\">"+
        "<button type=\"submit\">上傳</button>"+
        "</form>"
const html_uploads = "<form action=\"/uploads\" method=\"post\" enctype=\"multipart/form-data\">"+
"<input name=\"fileUpload\" type=\"file\" />"+
"<input name=\"fileUpload\" type=\"file\" />"+
"<img src=\"\" alt=\"\">"+
"<button type=\"submit\">上傳</button>"+
"</form>"
const html_upload_template = "<form action=\"/uploadTemplate\" method=\"post\" enctype=\"multipart/form-data\">"+
"<input name=\"fileUpload\" type=\"file\" />"+
"<input name=\"fileUpload\" type=\"file\" />"+
"<img src=\"\" alt=\"\">"+
"<button type=\"submit\">上傳</button>"+
"</form>"

router.get('/upload', function(req, res) {  //測試上傳
    res.send(html_upload);
});
router.get('/uploads', function(req, res) {  //測試上傳
    res.send(html_uploads);
});

router.post('/upload', upload.single('fileUpload'), uploadFunc.fileUpload);
router.post('/uploads', upload.array('fileUpload'), uploadFunc.fileUploads);

router.get('/uploadTemplate', function(req, res) {  //測試上傳
    res.send(html_upload_template);
});
router.post('/uploadTemplate', uploadTemplate.array('fileUpload') ,require('../controllers/system/uploadTemplateController'));
//-------upload test---------

module.exports = router;