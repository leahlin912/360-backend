const express = require("express");
const system_codeController = require("../../controllers/system/system_codeController");

const router = express.Router();

router.post("/add", system_codeController.addSystem_code)
.post("/get", system_codeController.getSystem_code)
.post("/getSystem_codes", system_codeController.getSystem_codes);

module.exports = router;