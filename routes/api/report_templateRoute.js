const express = require("express");
const report_templateController = require("../../controllers/report/report_templateController");
const router = express.Router();

router.post("/add", report_templateController.addReport_template)
.delete("/delete", report_templateController.deleteReport_template)
.post("/update", report_templateController.updateReport_template)
.post("/get", report_templateController.getReport_template)
.post("/getReport_templates", report_templateController.getReport_templates);

module.exports = router;