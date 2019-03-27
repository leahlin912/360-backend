//subject:專案pr統計管理
//create:190123
//author:陳冠穎

const errorHandler = require("../../utils/errorHandler");
const successHandler = require('../../utils/successHandler');
const checkNil = require("../../utils/nullChecker");
const Project = require("../../models/project");
const Employee = require("../../models/employee");
const Project_pr = require("../../models/project_pr");
const Topic = require('../../models/topic');
const ProTopicRes = require('../../models/pro_topic_res');
const Parameter = require('../../models/parameter');
const mongoose = require("mongoose");
const PR_VALUE = 10;

//pr值計算
const prCal = async(req,res,next)=>{
    let project_id = req.params.project_id;

    if(checkNil(req.params, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    //0.用project_id 得到歸類topic，並依部門與受評能力(ability)分類pr項目    
    //找專案設定的題目
    let topicList;              //專案題目的集合
    let project_pr_arr=[];      //存放有幾個pr項目
    let department_id = null;
    let ability_id = null;
    let pr_topics = [];
    let proTopicsArr ;
    let parameter ;
    let findProPr;

    try{
        parameter = await Parameter.findOne({});    //抓參數
        proTopicsArr = await Project.findOne({_id:project_id},{topic_id:1});    //抓專案

        if(!proTopicsArr || !proTopicsArr){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        //如果有project pr的資料刪除
        findProPr = await Project_pr.find({project_id:project_id});
        if(findProPr.length > 0){
            await Project_pr.deleteMany({project_id:project_id});
        }

        //依部門、受評能力、題目編號排序
        topicList = await Topic.find({"_id":{"$in":proTopicsArr.topic_id}})
                            .sort({applicable_dep_id:1,ability_id:1,topic_code:1});   //此專案分數題的集合

        topicList =JSON.parse(JSON.stringify(topicList)); //拷貝物件

        //針對題目的部門、受評能力分類pr項目
        for(let i=0; i<topicList.length; i++){
            if(!department_id) department_id = topicList[i].applicable_dep_id;
            if(!ability_id)  ability_id = topicList[i].ability_id;
            pr_topics.push(topicList[i]._id);

            //不是最後一個 && 相同部門 && 相同受評能力 => 維持同一個pr項目
            if(i != topicList.length-1 && 
                (department_id == topicList[i+1].applicable_dep_id) && 
                (ability_id == topicList[i+1].ability_id))
            continue;  
            
            project_pr_arr.push(
                {
                    department_id:department_id,
                    ability_id:ability_id,
                    pr_topics:pr_topics
                }
            );

            department_id = null;
            ability_id = null;
            pr_topics = [];
        }

    //1.組織employee_prs員工pr值清單
        for(let i=0; i < project_pr_arr.length; i++){
            let isFall = false;     //判斷此pr項目是否有可判定的題目與員工
            let	pr_avg = 0;	        //整體能力分數平均值
            let	maxRank = 0;	    //最大排名
            let	minRank = 0;	    //最小排名
            let	distanceRank = 0;	//全距:最大-最小排名
            let scoreTopicList;     //此PR 需要判定分數題的題目
            let scoreTopicListById = [];    //分數題的id list
            let scoreTopicNum;      //分數題數量
            let empList;            //此PR 需要判定的員工list
            let empListById =[];    //員工id list
            let aggregateArr = [];  //aggregate條件的array
            let empProResListGroup; //依aggregate條件所撈出來的emp_topic_res資料
            let sum_avg = 0;            //所有員工的pr平均分數加總

            //把題目排除只剩分數題
            scoreTopicList = await Topic.find(
                {$and:[{_id:{$in:project_pr_arr[i].pr_topics}},{type:2}]},{_id:1});

            if(!scoreTopicList){
                console.log("no scoreTopicList");
                //增加空集合
                project_pr_arr[i].pr_avg = pr_avg;
                project_pr_arr[i].maxRank = maxRank;
                project_pr_arr[i].minRank = minRank;
                project_pr_arr[i].distanceRank = distanceRank;
                project_pr_arr[i].employee_prs = [];
                isFall = true;
            }
            if(isFall) continue;

            scoreTopicListById = scoreTopicList.map((value, index, array) =>{
                return new mongoose.Types.ObjectId(value._id);
            })
            scoreTopicNum = scoreTopicListById.length;//分數題數量

            //pr有分部門，撈相同部門的員工清單
            if(project_pr_arr[i].department_id != null){
                empList = await Employee.find(
                    {$and:[
                        {department_id:project_pr_arr[i].department_id},
                        {res_date:null}]},
                    {_id:1})
                    .sort({account:1}).exec()
                
                if( !empList){
                    console.log("no empList");
                    //增加空集合
                    project_pr_arr[i].pr_avg = pr_avg;
                    project_pr_arr[i].maxRank = maxRank;
                    project_pr_arr[i].minRank = minRank;
                    project_pr_arr[i].distanceRank = distanceRank;
                    project_pr_arr[i].employee_prs = [];
                    isFall = true;
                }

                empListById = empList.map((value, index, array) =>{
                    return new mongoose.Types.ObjectId(value._id);
                })
            }
            if(isFall) continue;

            //用分數題目ID 與 部門員工清單 去資料庫撈ProTopicRes 題目回應檔的分數總合
            aggregateArr.push({"$unwind" : "$topic"});      //將topic array 拆成每一筆
            if(project_pr_arr[i].department_id != null){    //判斷有沒有帶部門ID match條件不同
                aggregateArr.push({"$match": {$and:[
                    {project_id:new mongoose.Types.ObjectId(project_id)},
                    {be_evaluated_id:{"$in":empListById}},
                    {'topic.topic_id':{"$in":scoreTopicListById}}
                ]}} );
            }else{
                aggregateArr.push({"$match": {$and:[
                    {project_id:new mongoose.Types.ObjectId(project_id)},
                    {'topic.topic_id':{"$in":scoreTopicListById}}
                ]}} );
            }
            aggregateArr.push({"$project" : { "be_evaluated_id" : 1 , "pr_avg":"$topic.topic_score"  }}); //整理結果
            aggregateArr.push({"$group":{_id:'$be_evaluated_id',"pr_avg":{"$sum": "$pr_avg"},"assessment_num":{"$sum": 1}}} );//依評量人group
            aggregateArr.push({"$project" : {"_id":1,"pr_avg":{ "$divide": [ "$pr_avg","$assessment_num"] }, "assessment_num":1}}); //整理結果
            aggregateArr.push({"$sort": {"pr_avg":-1, "assessment_num":-1 }});    //平均分數、評比人數排名
            empProResListGroup = await ProTopicRes.aggregate(aggregateArr);

            if(empProResListGroup.length == 0) continue;

            empProResListGroup = empProResListGroup.map((value, index, array) =>{
                return {be_evaluated_id:value._id,  //評量人
                        pr_avg:value.pr_avg,        //平均分數
                        assessment_num:value.assessment_num}    //評量人數
            })

            //分數題數量大於1，總分/分數題目數
            if(scoreTopicNum>1){
                for(let i=0; i<empProResListGroup.length; i++){
                    empProResListGroup[i].pr_avg = empProResListGroup[i].pr_avg / scoreTopicNum;
                }
            }

            //1.排名1:按分數排名
            //2.排名2:有同分的+1往下排序 =>排名1 + (重覆分數數量)
            //aggregate 撈出來已有照平均分數與評比人數排名，故直接排pr_no1、pr_no2
            //pr_no1 有同分的看參數設定(pr_same_score_decide) 
            //參數值為2.比較評比人數在排名 直接照排好的順序排pr_no2
            //參數值為1.強制往前調成同PR 在算完PR調整
            for(let i=0,no=1,no2=1,tmp=0; i<empProResListGroup.length; i++){
                let pr_avg = empProResListGroup[i].pr_avg;
                if(i>0 && tmp != pr_avg) no++;
                empProResListGroup[i]['pr_no1'] = no ;
                empProResListGroup[i]['pr_no2'] = no2++;
                tmp = pr_avg;
            }

            //3.抓出排名2 的最大最小排名 與 最大-最小的全距數
            if(empProResListGroup.length>1){
                maxRank = empProResListGroup.reduce(function(pValue, value, index, array){
                    return (pValue.pr_no2 > value.pr_no2) ? pValue : value;
                })
                maxRank = maxRank.pr_no2;
  
                minRank = empProResListGroup.reduce(function(pValue, value, index, array){
                    return (pValue.pr_no2 < value.pr_no2) ? pValue : value;
                })
                minRank = minRank.pr_no2;

                empProResListGroup.forEach(function(value, index, array){
                    return sum_avg += value.pr_avg
                });
                pr_avg = sum_avg / empProResListGroup.length; //pr 整體平均分數

            }else{
                maxRank =  empProResListGroup[0].pr_no2;
                minRank = maxRank;
                sum_avg = empProResListGroup[0].pr_avg;
                pr_avg = sum_avg;
            }

            //4.(最大排名數 - 排名2成績) / 全距數 * 10， (四捨五入)
            distanceRank = maxRank - minRank ;

            for(let i=0; i<empProResListGroup.length; i++){
                if(distanceRank == 0){
                    empProResListGroup[i]['pr_value'] = PR_VALUE; 
                }else{
                    empProResListGroup[i]['pr_value'] = Math.round(((maxRank - empProResListGroup[i].pr_no2) / distanceRank) * PR_VALUE);
                }
            }

            //參數設定(pr_same_score_decide) ，1.強制往前調成同PR 
            if(parameter.pr_same_score_decide == 1){
                empProResListGroup.reduce(function(pValue, value, index, array){
                    if(pValue.pr_no1 == value.pr_no1)
                        value.pr_value = pValue.pr_value;
                    return value;
                });
            }

            //組合結果，存入Project_pr
            await new Project_pr({
                project_id:project_id,
                department_id:project_pr_arr[i].department_id,
                ability_id:project_pr_arr[i].ability_id,
                pr_topics:project_pr_arr[i].pr_topics,
                pr_avg:pr_avg,
                maxRank:maxRank,
                minRank:minRank,
                distanceRank:distanceRank,
                employee_prs:empProResListGroup
            }).save();
        }//end project_pr_arr for
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
        return;
    }
     
    res.send(successHandler); 
}

module.exports = {
    prCal
};