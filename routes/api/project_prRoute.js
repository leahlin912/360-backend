const express = require("express");
const project_prController = require("../../controllers/project/project_prController");
const prCalController = require('../../controllers/project/prCalculationController');

const router = express.Router();

router.post("/add", project_prController.addProject_pr)
.delete("/delete", project_prController.deleteProject_pr)
.post("/update", project_prController.updateProject_pr)
.post("/get", project_prController.getProject_pr)
.post("/getProject_prs", project_prController.getProject_prs)
.get('/prCal/:project_id', prCalController.prCal);

module.exports = router;