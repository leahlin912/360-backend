const express = require("express");
const TokenController = require("../../controllers/my_test/tokenController");
const router = express.Router();

router.post("/mytest", TokenController.getToken);

module.exports = router;