const express = require("express");
const purviewController = require("../../controllers/system/purviewController");

const router = express.Router();

router.post("/add", purviewController.addPurview)
.delete("/delete/:_id", purviewController.deletePurview)
.post("/update", purviewController.updatePurview)
.post("/get", purviewController.getPurview)
.post("/getPurviews", purviewController.getPurviews);

module.exports = router;