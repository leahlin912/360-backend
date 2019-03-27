//subject:專案評量關係人管理路由
//create:190107
//author:陳冠穎

const express = require('express');

const evaluationListController = require('../../controllers/assessment/evaluationListController');

const router = express.Router();

router.post('/updEvaluationList', evaluationListController.updEvaluationList)
    .post('/getList', evaluationListController.getList)
    .post('/getSubEvaluationList', evaluationListController.getSubEvaluationList)
    .post('/updSubEvaluationListStatus', evaluationListController.updSubEvaluationListStatus)
    .post("/add", evaluationListController.addEvaluationList)
    .post("/getEvaluations", evaluationListController.getEvaluationLists)
    .post("/getAllFirstStatus", evaluationListController.getAllFirstStatus)
    .post("/HRUpdateEvaluationList", evaluationListController.HRUpdateEvaluationList)
    .post("/getAllSecondStatusMembers", evaluationListController.getAllSecondStatusMembers)
    .post("/getSecondStatus_be_evaluated", evaluationListController.getSecondStatus_be_evaluated)
    .post("/getProject_status", evaluationListController.getProject_status);

module.exports = router;