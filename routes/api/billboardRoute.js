//subject:公告欄管理路由
//create:190107
//author:陳冠穎

const express = require('express');

const billboardController = require('../../controllers/system/billboardController');

const router = express.Router();

router.post('/add', billboardController.addBillboard)
    .post('/upd', billboardController.updBillboard)
    .post('/del', billboardController.delBillboard)
    .get('/getList', billboardController.getBillboard)
    .post('/search',billboardController.searchBillboard);

module.exports = router;