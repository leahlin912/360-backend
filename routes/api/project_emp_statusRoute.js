const express = require("express");
const project_emp_statusController = require("../../controllers/project/project_emp_statusController");
const router = express.Router();

router.post("/add", project_emp_statusController.addProject_emp_status)
.post("/update", project_emp_statusController.updateProject_emp_status)


module.exports = router;