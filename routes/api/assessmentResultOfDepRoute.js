//subject:專案評量部門管理路由
//create:190114
//author:陳冠穎

const express = require('express');

const assessmentResultOfDepController = require('../../controllers/assessment/assessmentResultOfDep');

const router = express.Router();

router.post('/getAssessmentResultList', assessmentResultOfDepController.getAssessmentResultList) ;

module.exports = router;