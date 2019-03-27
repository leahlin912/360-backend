const mongoose = require("mongoose");       //在這一層把mongooseimport進來
const Schema = mongoose.Schema;             //軒告一個Schema的變數用來存Schema

const project_prSchema = new Schema({             //設計Schema    
    project_id: {type: Schema.Types.ObjectId, ref: "project"},  //專案代號id
    department_id:{type: Schema.Types.ObjectId, ref: "department"},  //部門代號
    ability_id:{type: Schema.Types.ObjectId, ref: "ability"},    //受評能力id
    pr_topics: [{type: Schema.Types.ObjectId, ref:"topic"}],      //PR值題目計算項目id => 1.限定專案檔的題目，不可重覆
    pr_avg: Number,//公司PR平均值
    maxRank:Number,	//最大排名
	minRank:Number,	//最小排名
	distanceRank:Number,	//全距:最大-最小排名
    employee_prs: [
        {
            be_evaluated_id: {type: Schema.Types.ObjectId, ref:"employee"},     //受評人id => A人
            pr_value: Number,   //PR值
            pr_no1: Number,     //PR值排名1
            pr_no2:Number,	  //PR值排名 2
            pr_avg:Number,	  //PR分數平均值
            assessment_num:Number //評分人數
        }
    ]
});

module.exports = mongoose.model("project_pr", project_prSchema);