const express = require("express");
const parameterController = require("../../controllers/system/parameterController");

const router = express.Router();

router.post("/add", parameterController.addParameter)
.post("/update", parameterController.updateParameter)
.post("/getParameters", parameterController.getParameters)
.post("/setParametersStatus", parameterController.setParametersStatus);

module.exports = router;