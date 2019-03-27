//subject:匯出路由管理
//create:190119
//author:陳冠穎

const express = require("express");
const exportForEjsexcelController = require("../../controllers/report/exportForEjsexcelController");

const router = express.Router();

router.post('/nodeExcelExport', require('../../utils/nodeExcelExport').exportExcel)
    .get('/node4excelExport', require('../../utils/node4excelExport'))
    .get('/ejsExcelExport/:project_id/:be_evaluated_id', exportForEjsexcelController.exportEjsexcel)
    .get('/ejsExcelExportAll/:project_id', exportForEjsexcelController.exportEjsexcelAll);

module.exports = router;