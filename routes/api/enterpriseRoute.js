const express = require("express");
const enterpriseController = require("../../controllers/user/enterpriseController");

const router = express.Router();

router.post("/add", enterpriseController.addEnterprise)
.delete("/delete", enterpriseController.deleteEnterprise)
.post("/update", enterpriseController.updateEnterprise)
.post("/get", enterpriseController.getEnterprise)
.post("/getEnterprises", enterpriseController.getEnterprises);

module.exports = router;