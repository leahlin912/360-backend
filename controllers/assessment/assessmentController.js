//subject:專案評量管理
//create:190110
//author:陳冠穎

const errorHandler = require('../../utils/errorHandler');
const successHandler = require('../../utils/successHandler');
const EvaluationList = require('../../models/evaluation_list');
const ProTopicRes = require('../../models/pro_topic_res');
const checkNil = require('../../utils/nullChecker');
const getAssessmentResFunc = require('./assessmentResultFunc');

//取得需要評量的對象
const getAssessmentList = (req, res, next) => {
    let project_id = req.body.project_id;
    let user_id = req.body.user_id;

    if(checkNil(req.body, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    EvaluationList.find({
        $and:[
            {project_id: project_id},
            {evaluated:{$elemMatch:{evaluated_id:user_id}}}
        ]
    })
    .populate('project_id')
    .populate({
        path:'be_evaluated_id',
        populate: { path: 'department_id' ,
        populate: { path: 'enterprise_id'}}
    })
    .populate('evaluated.evaluated_id')
    .exec( (err, eva) => {
        if(err){
            next(err);
            return;
        }
        if(!eva){// not found
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        res.send(eva);
        return;
    });
};

//更新評量回應
const updAssessment = async (req, res, next) => {
    let project_id = req.body.project_id;
    let be_evaluated_id = req.body.be_evaluated_id; //評量對象
    let user_id = req.body.user_id;
    let result_anonymous = req.body.result_anonymous; //匿名否
    let topic = JSON.parse(req.body.topic); //回應題目
    let suggest = req.body.suggest; //同事建議內容
    let completed = req.body.completed; //儲存=>false / 送出=>true 
    let proTopicResWhere;

    if(checkNil(req.body, 7 ,['suggest'])){
        next(errorHandler.FAIL);
        return;
    }

    proTopicResWhere = {$and:[
            {project_id: project_id},
            {be_evaluated_id:be_evaluated_id},
            {evaluated_id:user_id}
    ]};

    try{
        //更新回應檔
        let findProTopicRes = await ProTopicRes.find(proTopicResWhere).exec();
        if(findProTopicRes.length > 0){
            await ProTopicRes.updateOne(proTopicResWhere,
                {$set:{result_anonymous:result_anonymous,topic:topic,suggest:suggest}}
            );
        }else{
            await new ProTopicRes({
                project_id: project_id,
                be_evaluated_id:be_evaluated_id,
                evaluated_id:user_id,
                result_anonymous:result_anonymous,
                topic:topic,
                suggest:suggest
            }).save();
        }

        //更新關係人檔評量人完成
        await EvaluationList.updateOne(
                {$and:[
                        {project_id: project_id},
                        {be_evaluated_id:be_evaluated_id},
                        {evaluated:{$elemMatch:{evaluated_id:user_id}}}
                ]},
                {$set:{"evaluated.$.evaluation_completed":completed}}
        );
        
        //更新受評人 與 評量人的 整體完成否
        //be_evaluated_completed	受評人評量完成否	T/F
        let findBeEvaluatedCompleted = await EvaluationList.find({
            $and:[{project_id:project_id},
                  {be_evaluated_id:be_evaluated_id},
                  {evaluated:{$elemMatch:{evaluation_completed:false}}}
        ]});  

        if(findBeEvaluatedCompleted.length == 0){
            await EvaluationList.updateOne(
                {$and:[
                        {project_id: project_id},
                        {be_evaluated_id:be_evaluated_id}
                ]},
                {$set:{be_evaluated_completed:true}}
            );
        }

        //evaluated_all_completed	評量他人完成否	T/F
        let findEvaluatedCompleted = await EvaluationList.find({
            $and:[{project_id:project_id},
                  {evaluated:{$elemMatch:{evaluated_id:user_id}}},
                  {evaluated:{$elemMatch:{evaluation_completed:false}}}
        ]});  

        if(findEvaluatedCompleted.length == 0){
            await EvaluationList.updateOne(
                {$and:[
                        {project_id: project_id},
                        {be_evaluated_id:user_id}
                ]},
                {$set:{evaluated_all_completed:true}}
            );
        }

    }catch(e){
        console.log(e.message)
        next(errorHandler.INTERNAL_DB_ERROR);
        return;
    }

    res.send(successHandler);
    return;
};

//取得評量結果
const getAssessmentResult = async (req, res, next) => {
    if(checkNil(req.body, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    try{
        let result = await getAssessmentResFunc.getAssessmentResultByPerson(req.body.project_id, req.body.user_id);

        if(result == "-1") {
            next(errorHandler.DATA_NOT_FOUND);
        }else{
            res.send(result);
        }
        return;
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
    }
};

//取得專案全部員工的評量結果
const getAllAssessmentResult = async (req, res, next) => {
    if(checkNil(req.params, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    try{
        let result = [];
        let evaList = await EvaluationList.find({project_id:req.params.project_id});

        for(let i=0; i<evaList.length; i++){
            let resultStr = await getAssessmentResFunc.getAssessmentResultByPerson(req.params.project_id, evaList[i].be_evaluated_id);
            if(resultStr == "-1") continue;
            result.push(resultStr);
        }

        if(result.length == 0) {
            next(errorHandler.DATA_NOT_FOUND);
        }else{
            res.send(result);
        }
        return;
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
    }
};

//登入者歷史互評紀錄(評別人的)
const getHistoricalRecordOfTopicRes = async (req, res, next) => {
    let user_id = req.params.user_id;

    if(checkNil(req.params, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    try{
        let findHisRecord =await ProTopicRes.find({evaluated_id:user_id})
                        .populate('project_id')
                        .populate('be_evaluated_id')
                        .populate('evaluated_id')
                        .populate('topic.topic_id')
                        .sort({'project_id.project_code':-1})
                        .exec()
        
        if(findHisRecord.length > 0){
            res.send(findHisRecord)
            return;
        } 
        next(errorHandler.DATA_NOT_FOUND);  
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    getAssessmentList,
    updAssessment,
    getAssessmentResult,
    getHistoricalRecordOfTopicRes,
    getAllAssessmentResult
}