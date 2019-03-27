const express = require("express");
const router = express.Router();
const mainRoute = require("./mainRoute");
const apiRoute = require('./api');

router.use("/", mainRoute);
router.use("/api", apiRoute);
router.get("/about",(req,res,next) => {
    res.send({test:'test'});
})

module.exports = router;