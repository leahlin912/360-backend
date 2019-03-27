const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parameterSchema = new Schema({
    pr_same_score_decide: Number,
    current_project_id: {type: Schema.Types.ObjectId, ref:"project"}
});

module.exports = mongoose.model("parameter", parameterSchema);