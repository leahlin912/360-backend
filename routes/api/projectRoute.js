const express = require("express");
const projectController = require("../../controllers/project/projectController");

const router = express.Router();

router.post("/add", projectController.addProject)
.delete("/delete/:_id", projectController.deleteProject)
.post("/update", projectController.updateProject)
.post("/get", projectController.getProject)
.post("/getProjects", projectController.getProjects);

module.exports = router;