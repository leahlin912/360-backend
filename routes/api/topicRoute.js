const express = require("express");

const topicController = require("../../controllers/project/topicController");

const router = express.Router();

router.post("/add", topicController.addTopic)
.delete("/delete/:_id", topicController.deleteTopic)
.post("/update", topicController.updateTopic)
.post("/get", topicController.getTopic)
.post("/getTopics", topicController.getTopics);

module.exports = router;