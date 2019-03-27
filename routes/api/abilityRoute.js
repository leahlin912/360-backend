const express = require("express");
const abilityController = require("../../controllers/project/abilityController");

const router = express.Router();

router.post("/add", abilityController.addAbility)
.delete("/delete/:_id", abilityController.deleteAbility)
.post("/getAbilitys", abilityController.getAbilitys);

module.exports = router;