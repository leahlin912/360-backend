const express = require("express");

const employeeController = require("../../controllers/user/employeeController");

const multer = require("multer");
const upload = multer();

const router = express.Router();

router.post("/importAllEmployees",upload.single("allEmployees"), employeeController.importAllEmployees)
.post("/add", employeeController.addEmployee)
.delete("/delete/:_id", employeeController.deleteEmployee)
.post("/update", employeeController.updateEmployee)
.post("/get", employeeController.getEmployee)
.post("/getEmployees", employeeController.getEmployees)
.post("/setPurview", employeeController.setPurview);

module.exports = router;