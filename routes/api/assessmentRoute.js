//subject:專案評量管理路由
//create:190111
//author:陳冠穎

const express = require('express');

const assessmentController = require('../../controllers/assessment/assessmentController');

const router = express.Router();

router.post('/getAssessmentList', assessmentController.getAssessmentList)
    .post('/updAssessment', assessmentController.updAssessment)
    .post('/getAssessmentResult', assessmentController.getAssessmentResult)
    .get('/getHistoricalRecordOfTopicRes/:user_id', assessmentController.getHistoricalRecordOfTopicRes)
    .get('/getAllAssessmentResult/:project_id', assessmentController.getAllAssessmentResult);

module.exports = router;