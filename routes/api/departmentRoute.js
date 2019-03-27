const express = require("express");
const departmentController = require("../../controllers/user/departmentController");

const router = express.Router();

router.post("/add", departmentController.addDepartment)
.delete("/delete/:_id", departmentController.deleteDepartment)
.post("/update", departmentController.updateDepartment)
.post("/get", departmentController.getDepartment)
.post("/getDepartments", departmentController.getDepartments);

module.exports = router;