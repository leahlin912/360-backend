const express = require("express");
const Pro_topic_resController = require("../../controllers/project/pro_topic_resController");
const router = express.Router();

router.post("/add", Pro_topic_resController.addPro_topic_res)
      .get("/getHistoricalProject/:user_id", Pro_topic_resController.getHistoricalProject);


module.exports = router;