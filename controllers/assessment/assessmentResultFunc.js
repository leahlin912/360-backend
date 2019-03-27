//subject:回傳專案評量結果
//create:190113
//author:陳冠穎

const mongoose = require("mongoose");
const Employee = require('../../models/employee');
const EvaluationList = require('../../models/evaluation_list');
const ProTopicRes = require('../../models/pro_topic_res');
const Project_PR = require('../../models/project_pr');
const Topic = require('../../models/topic');

const getAssessmentResultByPerson = async(project_id,user_id)=>{
    let combineResult = {};

    if(project_id==undefined || user_id ==undefined){
        return "-1";
    }

    try{
        let empData = await Employee.findOne({_id:user_id});
        if(!empData) return"-1";
        combineResult['employee'] = empData;

        let findEvaList = await EvaluationList.findOne({
            $and:[
                {project_id: project_id},
                {be_evaluated_id:user_id}
            ]
        })
        .populate('project_id')
        .populate({
            path:'be_evaluated_id',
            populate: { path: 'department_id' ,
            populate: { path: 'enterprise_id'}}
        })
        .populate( {
            path:'evaluated.evaluated_id'
        })
        .exec();

        if(!findEvaList){
            return "-1";
        }else{
            let topic_res = [];
            let pro_PR_JSON;
            let resultEvaListJSON = JSON.parse(JSON.stringify(findEvaList));
            combineResult['evaluation_list'] = resultEvaListJSON;
            let findProPR;
            
            //save ProTopicRes to resultEvaListJSON
            for(let i=0;  i<resultEvaListJSON.evaluated.length; i++){
                let evaTmp = resultEvaListJSON.evaluated[i];
                let findProTopicRes;
                let findProTopicResJSON;

                findProTopicRes = await ProTopicRes.findOne(
                    {$and:[
                        {project_id: project_id},
                        {be_evaluated_id:user_id},
                        {evaluated_id:evaTmp.evaluated_id}
                    ]}
                )
                .populate('project_id')
                .populate('be_evaluated_id')
                .populate('evaluated_id')
                .populate({
                    path:'topic.topic_id'
                })
                .exec();  
                
                findProTopicResJSON = JSON.parse(JSON.stringify(findProTopicRes));
                if(findProTopicRes){
                    topic_res.push(findProTopicResJSON);
                    resultEvaListJSON.evaluated[i]['pro_topic_res'] = findProTopicResJSON.topic;
                }   
            }
            combineResult['pro_topic_res'] = topic_res;

            //save pro_pr to resultEvaListJSON
            findProPR = await Project_PR.find( 
                    {$and:[
                        {project_id: project_id},
                        {'employee_prs.be_evaluated_id':user_id}
                    ]},
                    {
                        project_id:1,department_id:1,ability_id:1,pr_topics:1,pr_avg:1,maxRank:1,minRank:1,distanceRank:1,assessment_num:1 ,
                        'employee_prs':{$elemMatch:{'be_evaluated_id':user_id}}
                    }
            )
            .sort({department_id:1})
            .populate('project_id')
            .populate('department_id')
            .populate('ability_id')
            .populate('pr_topics')
            .populate('employee_prs.be_evaluated_id')
            .exec();

            pro_PR_JSON = JSON.parse(JSON.stringify(findProPR));

            //classify 依pr 、 題目 分類-------190129---------------------------------------
            for(let i=0; i < pro_PR_JSON.length; i++){
                let classifyTopicObj = {};//分類pr的題目物件，最後加入pro_PR_JSON物件裡
                let pr = pro_PR_JSON[i];
                //依題型歸類
                let topicAllIdArr;
                let topicType1IdArr;
                let topicType2IdArr;
                let topicType3IdArr;
                let qa = [];
                let score = {};
                let select = [];
                //topicType2IdArr變數
                let evaluationList ;
                let supervisorId = [];    //主管id 集合
                let colleagueId = [];     //同事id 集合
                let subordinateId = [];   //下屬id 集合
                let otherId = [];         //其他id 集合
                let supervisor = [];    //主管
                let colleague = [];     //同事
                let subordinate = [];   //下屬
                let other = [];         //其他
                let supervisorScore = 0;
                let colleagueScore = 0;
                let subordinateScore = 0;
                let otherScore = 0;
                //topicType3IdArr變數
                let topicObj;
                
                topicAllIdArr = pr.pr_topics.map((value,index,array)=>{
                    return value._id;
                });

                topicType1IdArr = await Topic.find({$and:[{_id:{"$in":topicAllIdArr}},{type:1}]},{_id:1});//問答
                topicType1IdArr = topicType1IdArr.map((value, index, array) =>{
                    return new mongoose.Types.ObjectId(value._id);
                });

                topicType2IdArr = await Topic.find({$and:[{_id:{"$in":topicAllIdArr}},{type:2}]},{_id:1});//分數
                topicType2IdArr = topicType2IdArr.map((value, index, array) =>{
                    return new mongoose.Types.ObjectId(value._id);
                });

                topicType3IdArr = await Topic.find({$and:[{_id:{"$in":topicAllIdArr}},{type:3}]},{_id:1});//選擇
                topicType3IdArr = topicType3IdArr.map((value, index, array) =>{
                    return new mongoose.Types.ObjectId(value._id);
                });

                //問答題彙整 => 條列顯示
                if(topicType1IdArr.length>0){
                    for(let k=0; k<topicType1IdArr.length; k++){
                        let findTopic = await Topic.findOne({_id:topicType1IdArr[k]})
                                                .populate('applicable_dep_id')
                                                .populate('ability_id');

                        let topicResArr = await ProTopicRes.aggregate([
                            {"$unwind" : "$topic"},
                            {"$match": {$and:[
                                {project_id:new mongoose.Types.ObjectId(project_id)},
                                {be_evaluated_id:new mongoose.Types.ObjectId(user_id)},
                                {'topic.topic_id':new mongoose.Types.ObjectId(topicType1IdArr[k])}
                            ]}},
                            {"$project" : { "evaluated_id" : 1 ,"result_anonymous":1, "topic_res":"$topic.topic_res"   }},
                            {"$lookup": {from: 'employees', localField: 'evaluated_id', foreignField: '_id', as: 'evaluated_id'} },
                            {"$unwind": {"path": "$evaluated_id","preserveNullAndEmptyArrays": true}}
                        ]);

                        qa.push({topic:findTopic,topic_res_list:topicResArr})
                    }
                }
                classifyTopicObj['qa'] = qa;

                //分數題彙整
                //分主管、同事、下屬、其他 分別統計，取平均分數
                if(topicType2IdArr.length>0){
                    //撈關係人清單
                    evaluationList = await EvaluationList.aggregate([
                        {"$unwind" : "$evaluated"},
                        {"$match": {$and:[
                            {project_id:new mongoose.Types.ObjectId(project_id)},
                            {be_evaluated_id:new mongoose.Types.ObjectId(user_id)}
                        ]}}
                    ]);

                    //分類關係人類別
                    evaluationList.forEach((value,index,array)=>{
                        let id = new mongoose.Types.ObjectId(value.evaluated.evaluated_id);
                        switch(value.evaluated.relation){
                            case '1':
                                supervisorId.push(id);
                                break;
                            case '2':
                                colleagueId.push(id);
                                break;
                            case '3':
                                subordinateId.push(id);
                                break;
                            case '4':
                                otherId.push(id);
                                break;
                            default:
                        }
                    });

                    //主管
                    if(supervisorId.length > 0){
                        supervisor = await ProTopicRes.aggregate(aggregateWhereForScore(project_id,user_id,supervisorId,topicType2IdArr));
                        supervisor.forEach((value,index,array)=>{
                            supervisorScore += value.pr_avg;
                        })
                        supervisorScore /= supervisorId.length;
                    }

                    //同事
                    if(colleagueId.length > 0){
                        colleague = await ProTopicRes.aggregate(aggregateWhereForScore(project_id,user_id,colleagueId,topicType2IdArr));
                        colleague.forEach((value,index,array)=>{
                            colleagueScore += value.pr_avg;
                        })
                        colleagueScore /= colleagueId.length;
                    }
                    
                    //下屬
                    if(subordinateId.length > 0){
                        subordinate = await ProTopicRes.aggregate(aggregateWhereForScore(project_id,user_id,subordinateId,topicType2IdArr));
                        subordinate.forEach((value,index,array)=>{
                            subordinateScore += value.pr_avg;
                        })
                        subordinateScore /= subordinateId.length;
                    }
                    
                    //其他 
                    if(otherId.length > 0){
                        other = await ProTopicRes.aggregate(aggregateWhereForScore(project_id,user_id,otherId,topicType2IdArr));
                        other.forEach((value,index,array)=>{
                            otherScore += value.pr_avg;
                        })
                        otherScore /= otherId.length;
                    }

                    //將分類資料寫進score物件
                    score['supervisor'] = {evaluated:supervisor,Score:supervisorScore};
                    score['colleague'] = {evaluated:colleague,Score:colleagueScore};
                    score['subordinate'] = {evaluated:subordinate,Score:subordinateScore};
                    score['other'] = {evaluated:other,Score:otherScore};
                }
                classifyTopicObj['score'] = score;

                //選擇題彙整 => 列出此選項有幾個人選
                if(topicType3IdArr.length>0){
                    //依題目篩選
                    for(let k=0; k<topicType3IdArr.length; k++){
                        let optArr=[];
                        let findTopic = await Topic.findOne({_id:topicType3IdArr[k]})
                                                .populate('applicable_dep_id')
                                                .populate('ability_id');

                        topicObj = JSON.parse(JSON.stringify(findTopic));

                        //依題目查找回應檔
                        let topicResArr = await ProTopicRes.aggregate([
                            {"$unwind" : "$topic"},
                            {"$match": {$and:[
                                {project_id:new mongoose.Types.ObjectId(project_id)},
                                {be_evaluated_id:new mongoose.Types.ObjectId(user_id)},
                                {'topic.topic_id':new mongoose.Types.ObjectId(topicType3IdArr[k])}
                            ]}},
                            {"$project" : { "evaluated_id" : 1 ,"result_anonymous":1, "topic_res":"$topic.topic_res"   }},
                             {"$lookup": {from: 'employees', localField: 'evaluated_id', foreignField: '_id', as: 'evaluated_id'} },
                             {"$unwind": {"path": "$evaluated_id","preserveNullAndEmptyArrays": true}},
                             {"$group":{_id:{ "topic_res": "$topic_res"},"evaluated":{"$push":{"evaluated_id":"$evaluated_id","result_anonymous": "$result_anonymous" }}, "option_num":{"$sum": 1}}} ,
                             {"$project" : { "_id":0, "topic_res" : "$_id.topic_res" ,"evaluated":1, "option_num":1   }}   
                        ]);

                        //topic 中的option 對應 回應檔中的題目回應
                        for(let j=0; j<topicObj.option.length; j++){
                            let optStr = topicObj.option[j];
                            let isEmpty = true;
                            let optObj={};
                            let optResObj={};
                            for(let f=0; f<topicResArr.length; f++){
                                if(optStr == topicResArr[f].topic_res){
                                    optResObj = topicResArr[f];
                                    isEmpty = false;
                                    break;
                                }
                            }

                            if(isEmpty){
                                //沒有對應的塞空的集合
                                optObj['option_res'] = {
                                    topic_res:optStr,
                                    option_num:0,
                                    evaluated:[]
                                }
                            }else{
                                optObj['option_res'] = optResObj;
                            }
                            optArr.push(optObj)
                        }
                        topicObj.option = optArr;//依撈到的資料替代題目檔中的option
                    }
                    select.push(topicObj);
                }
                classifyTopicObj['select'] = select;
                pro_PR_JSON[i]['classify_topic'] = classifyTopicObj;
            }        
            
            combineResult['project_pr'] = pro_PR_JSON;
            resultEvaListJSON['project_pr'] = pro_PR_JSON;

            return combineResult;
        };
    }catch(e){
        console.log(e.message);
        return "-1";
    } 
};

function aggregateWhereForScore(project_id,user_id,evaluatedIdArr,topicArr){
    let aggregateArr = [];

    aggregateArr.push({"$unwind" : "$topic"});
    aggregateArr.push({"$match": {$and:[
        {project_id:new mongoose.Types.ObjectId(project_id)},
        {be_evaluated_id:new mongoose.Types.ObjectId(user_id)},
        {evaluated_id:{"$in":evaluatedIdArr}},
        {'topic.topic_id':{"$in":topicArr}}
    ]}});
    aggregateArr.push({"$project" : { "evaluated_id" : 1 ,"result_anonymous":1, "pr_avg":"$topic.topic_score"  }});
    aggregateArr.push({"$group":{_id:{ "evaluated_id": "$evaluated_id", "result_anonymous": "$result_anonymous" },"pr_avg":{"$sum": "$pr_avg"},"topic_num":{"$sum": 1}}});
    aggregateArr.push({"$project" : {"_id":1, "pr_avg":{ "$divide": [ "$pr_avg","$topic_num"] }, "topic_num":1}});
    aggregateArr.push({"$project" : { "_id":0, "evaluated_id" : "$_id.evaluated_id" ,"result_anonymous":"$_id.result_anonymous","pr_avg":1, "topic_num":1  }});
    aggregateArr.push({"$lookup": {from: 'employees', localField: 'evaluated_id', foreignField: '_id', as: 'evaluated_id'} });
    aggregateArr.push({"$unwind": {"path": "$evaluated_id","preserveNullAndEmptyArrays": true}});
    return aggregateArr;
}

module.exports = {
    getAssessmentResultByPerson
};
