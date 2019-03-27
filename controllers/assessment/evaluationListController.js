//subject:專案評量關係人管理
//create:190107
//author:陳冠穎

const errorHandler = require('../../utils/errorHandler');
const successHandler = require('../../utils/successHandler');
const EvaluationList = require('../../models/evaluation_list');
const Employee = require('../../models/employee');
const EvaluationListRecode = require('../../models/evaluation_list_recode');
const checkNil = require("../../utils/nullChecker");

//新增/修改自己選擇的專案關係人
const updEvaluationList = async (req, res, next) => {
    let project_id = req.body.project_id;//專案代號ID
    let user_id = req.body.user_id;//受評人ID
    let evaluated = JSON.parse(req.body.evaluated);//評量者

    let findEvaList;
    let where = {$and:[
            {project_id:project_id},
            {be_evaluated_id:user_id}]
        };

    if(checkNil(req.body, 3 ,[])){
        console.log('1')
        next(errorHandler.FAIL);
        return;
    };

    if(project_id === undefined || user_id === undefined ){
        console.log('2')
        next(errorHandler.INVALID_PARAMETER);
        return;
    };

    //supervisor_check	主管審核狀態	Y(已審核)/N(未審核)/P(不通過)/W(審核中)
    try{
        findEvaList = await EvaluationList.findOne(where);
        if(findEvaList){
            await EvaluationList.updateOne(where,
                {$set:{
                    evaluated: evaluated,
                    supervisor_check:'W'
                }}).exec((err,upd)=>{
                    if(err){
                        console.log('3')
                        next(errorHandler.INTERNAL_DB_ERROR);
                        return;
                    }

                    res.status(200).send(successHandler);
                    return;
                })
        }else{
            await new EvaluationList({
                project_id:project_id,
                be_evaluated_id:user_id,
                evaluated:evaluated
            }).save((err,ins)=>{
                if(err){
                    console.log('4')
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }

                res.status(200).send(successHandler);
                return;
            });
        }  
    }catch(e){
        console.log('5')
        next(errorHandler.INTERNAL_DB_ERROR);
        return;
    }
};

//取得自己選擇的專案關係人
const getList = (req, res, next) => {
    let project_id = req.body.project_id;
    let user_id = req.body.user_id;

    if(checkNil(req.body, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    };

    EvaluationList.find({$and:[{project_id: project_id},{be_evaluated_id:user_id}]})
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

//主管查看下屬選擇的專案關係人
const getSubEvaluationList = (req, res, next) => {
    let project_id = req.body.project_id;
    let user_id = req.body.user_id;
    let subEvaListArr = [];

    if(checkNil(req.body, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    };

    Employee.find({$and:[{supervisor_id: user_id},{res_date:null}]})
    .exec( async (err, emps) => {
        if(err){
            next(err);
            return;
        }
        if(emps.length == 0 || !emps){// not found
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        
        try{
            //抓下屬關係人
            for(let i=0; i < emps.length; i++){
                let item = {};
                item['employee'] = emps[i];

                let subEvaList = await EvaluationList.findOne(
                    {$and:[{project_id:project_id},{be_evaluated_id:emps[i]._id}]})  
                .populate('project_id')
                .populate({
                    path:'be_evaluated_id',
                    populate: { path: 'department_id'},
                    populate: { path: 'enterprise_id'},
                    populate: { path: 'supervisor_id'}
                })
                .populate({path:'evaluated.evaluated_id',
                    populate: { path: 'department_id'}
                })
                .exec();
                
                if(subEvaList==undefined){
                    item['EvaluationList'] = {};
                }else{
                    item['EvaluationList'] = subEvaList;
                }
                    
                subEvaListArr.push(item);
            }
            res.send(subEvaListArr);
        }catch(e){
            console.log(e.message);
            next(errorHandler.INTERNAL_SERVER_ERROR);
        }
        return;
    });
};

//更新主管審核評量人狀態
const updSubEvaluationListStatus = async (req, res, next) => {
    let project_id = req.body.project_id;
    let be_evaluated_id = req.body.be_evaluated_id;
    let supervisor_check = req.body.supervisor_check; //Y(已審核)//P(不通過)
    let supervisor_opinion = req.body.supervisor_opinion; //主管意見

    if(checkNil(req.body, 4 ,['supervisor_opinion'])){
        next(errorHandler.FAIL);
        return;
    };

    let evaListWhere = {
        $and:[
            {project_id: project_id},
            {be_evaluated_id:be_evaluated_id}]
    };

    if(!(supervisor_check == 'Y' || supervisor_check == 'P')){
        next(errorHandler.INVALID_PARAMETER);
        return;
    };

    //更新專案評核關係人檔
    try{
        await EvaluationList.updateOne(evaListWhere,
            {$set: {
                    supervisor_check: supervisor_check, 
                    supervisor_opinion:supervisor_opinion
            }}
        )
        .exec();

        //新增一筆專案評核紀錄檔資料
        insertEvaListRecord(evaListWhere,project_id,be_evaluated_id);

        res.status(200).send("updated success!");
    }catch(e){
        next(errorHandler.INTERNAL_DB_ERROR);
    }

    return;
};

const insertEvaListRecord = async (evaListWhere,project_id,be_evaluated_id) =>{
    let findEvaList = await EvaluationList.findOne(evaListWhere);
    await new EvaluationListRecode({
        project_id:project_id,
        be_evaluated_id:be_evaluated_id,
        evaluation_list_obj:JSON.parse(JSON.stringify(findEvaList)),
        insert_date:new Date()
    }).save();
};

const addEvaluationList = async(req,res,next) => {
    console.log(req.body);
    if(checkNil(req.body, 7, ['evaluated','be_evaluation_completed','evaluated_all_completed','supervisor_check','supervisor_opinion'])){
        next(errorHandler.FAIL);
        return;
    }
    
    let evaluationList = new EvaluationList({
        project_id: req.body.project_id,
        be_evaluated_id: req.body.be_evaluated_id,
        evaluated: req.body.evaluated,
        be_evaluation_completed: req.body.be_evaluation_completed,
        evaluated_all_completed: req.body.evaluated_all_completed,
        supervisor_check: req.body.supervisor_check,
        supervisor_opinion: req.body.supervisor_opinion
    })

    await evaluationList.save();

    res.send(evaluationList);
}

//取得所有的evaluationList
const getEvaluationLists = async(req,res,next) => {

    let evaluationList = [];

    try{
        evaluationList = await EvaluationList.find({project_id: req.body.project_id})
                                            .populate('evaluated');

        let evaluation_status1_num = 0;
        let evaluation_status2_num = 0;
        let evaluation_status3_num = 0;
        let evaluation_status4_num = 0;
        let project_statusY_num = 0;
        let project_statusN_num = 0;
        let project_statusX_num = 0;
        
        //res.send(evaluationList);
        //let output = [];
        evaluationList.forEach( (obj) => {

            if (obj.supervisor_check === "N"){
                evaluation_status1_num++;
            }else if(obj.supervisor_check === "W"){
                evaluation_status2_num++;
            }else if(obj.supervisor_check === "P"){
                evaluation_status3_num++;
            }else if(obj.supervisor_check === "Y"){
                evaluation_status4_num++;
            }
            
            if(obj.be_evaluated_completed){
                project_statusY_num++;
            }else if(obj.be_evaluated_completed === false){
                project_statusN_num++;
            }

            let status = true;
            
            obj.evaluated.forEach((obj2) =>{
                if (obj2.evaluation_completed === false){
                    status = false;
                    obj.be_evaluation_completed = false;
                    obj.save();
                    return;
                }

                // if(obj2.evaluation_completed){
                //     let j = 0;
                //     for(j=0;j < output.length; j++){
                //         if(String(output[j].item) === String(obj2.evaluated_id)){
                //             output[j].times++;
                //             break;
                //         }
                //     }
                //     if(j === output.length){
                //         output.push({item: obj2.evaluated_id, times: 1});
                //     }
                // }
            })
            if (status === true){
                obj.be_evaluation_completed = true;
                //console.log(obj)
                obj.save();
                return;
            };  
        });

        //console.log(output);

        employees = await Employee.find({}, (err, employees) => {
            if(err){
                next(errorHandler.FAIL);
            }else{

                let size = 0;

                let evaluationList;

                evaluationList = EvaluationList.find({});

                for(i = 0 ; i < employees.length; i++){
                    if(employees[i].situation === "Y"){
                        size++;
                        continue;
                    }
                    for(j = 0 ; j < evaluationList.length; j++){
                        if(String(employees[i]._id) === String(evaluationList[j].be_evaluated_id)){
                            size++;
                            break;
                        }
                    }
                }

                    res.send({
                        employee_num: size,
                        evaluation_status1_num: size-(evaluation_status2_num+evaluation_status3_num+evaluation_status4_num),
                        evaluation_status2_num: evaluation_status2_num,
                        evaluation_status3_num: evaluation_status3_num,
                        evaluation_status4_num: evaluation_status4_num,
                        project_statusN_num: 0,
                        project_statusY_num: 0,
                        project_statusX_num: size
                    })
                }
            })
    }catch(err){
        next(err);
    }
}

const getProject_status = async (req,res,next) => {
    let evaluationList;

    evaluationList = await EvaluationList.find({project_id: req.body.project_id}).populate("evaluated.evaluated_id");
    //console印不出所有的東西 但是用 res.send就會看到
    
    var myObject = [];
    let counter = {};

    //res.send(evaluationList);

    for(i = 0 ; i < evaluationList.length ; i++){
        for(j = 0; j < evaluationList[i].evaluated.length; j++){
            let evaluatedTmp = evaluationList[i].evaluated[j];

            //console.log(evaluatedTmp.evaluated_id);
            if(evaluatedTmp.evaluated_id === null){
                continue;
            }
            //這邊改用宣告物件的方法 p.s思考問題的方式是資料結構五大總裡面的map(用KEY去找資料最快) 但是js沒有map這個方法 實現的方式是宣告物件(上網找)
            if(evaluatedTmp.evaluated_id._id in counter){               
                counter[evaluatedTmp.evaluated_id._id].total += 1
                counter[evaluatedTmp.evaluated_id._id].finished += (evaluatedTmp.evaluation_completed)?1:0
                counter[evaluatedTmp.evaluated_id._id].unfinished += (!evaluatedTmp.evaluation_completed)?1:0;
                continue;
            }
            counter[evaluatedTmp.evaluated_id._id] = {total: 1,
                finished: (evaluatedTmp.evaluation_completed)?1:0,
                unfinished: (!evaluatedTmp.evaluation_completed)?1:0};
                
            myObject.push({
                name: evaluatedTmp.evaluated_id.name,
                employee_job_no: evaluatedTmp.evaluated_id.job_no,
                employee_id: evaluatedTmp.evaluated_id._id,
                department_id: evaluatedTmp.evaluated_id.department_id,
                count: counter[evaluatedTmp.evaluated_id._id]
            });
        }
    }
    //console.log(counter);
    //res.send(myObject);
    var employees;
    employees = await Employee.find({});

    for(i = 0 ; i <employees.length; i++){
        //console.log(employees[i]);
        let checker = false;
        for(j = 0 ; j < myObject.length; j++){
            if(String(employees[i]._id) === String(myObject[j].employee_id)){
                //console.log(employees[i]);
                checker = true;
                break;
            }
        }
        if(checker){
            continue;
        }
        if(employees[i].situation === "Y"){
            myObject.push({
                name: employees[i].name,
                employee_job_no: employees[i].job_no,
                employee_id: employees[i]._id,
                department_id: employees[i].department_id,
                count: {
                    total: 0,
                    finished: 0,
                    unfinished: 0
                }
            });
        }
    }

    let project_statusY_num = 0;
    let project_statusN_num = 0;
    let project_statusX_num = 0; 

    for(let i = 0 ; i < myObject.length; i++){
        if(myObject[i].count.total === 0){
            project_statusX_num++;
        }else if(myObject[i].count.total === myObject[i].count.finished){
            project_statusY_num++;
        }else if(myObject[i].count.unfinished > 0){
            project_statusN_num++;
        }
    }

    res.send({
        project_statusY_num: project_statusY_num,
        project_statusN_num: project_statusN_num,
        project_statusX_num: project_statusX_num
    })
}

const getAllFirstStatus = async (req,res,next) =>{

    let evaluationList;

    try{
        evaluationList = await EvaluationList.find({project_id: req.body.project_id}).populate("be_evaluated_id").populate("evaluated");
        let size = evaluationList.length;

        var myObject = [];
        
        for(i = 0 ; i < size ; i++){    //js 可以.push 加上array裡
            if(evaluationList[i].be_evaluated_id === null){
                continue;
            }
            myObject.push({project_id: evaluationList[i].project_id,        
                be_evaluated_id: evaluationList[i].be_evaluated_id._id,
                be_evaluated_name: evaluationList[i].be_evaluated_id.name,
                be_evaluated_job_no: evaluationList[i].be_evaluated_id.job_no,
                be_evaluated_supervisor: evaluationList[i].be_evaluated_id.supervisor_id,
                be_evaluated_department_id: evaluationList[i].be_evaluated_id.department_id,
                evaluated: evaluationList[i].evaluated,
                be_evaluated_completed: evaluationList[i].be_evaluated_completed,
                evaluated_all_completed: evaluationList[i].evaluated_all_completed,
                supervisor_check: evaluationList[i].supervisor_check,
                supervisor_opinion: evaluationList[i].supervisor_opinion
            });
        }

        employees = await Employee.find({});

        for(i = 0 ; i < employees.length; i++){
            let check = false;
            for(j = 0 ; j < myObject.length; j++){
                if(String(employees[i]._id) === String(myObject[j].be_evaluated_id)){
                    check = true;
                    break;
                }
            }
            if(check){
                continue;
            }
            if(employees[i].situation === "Y"){
                myObject.push({project_id: myObject[0].project_id,        
                    be_evaluated_id: employees[i]._id,
                    be_evaluated_name: employees[i].name,
                    be_evaluated_job_no: employees[i].job_no,
                    be_evaluated_supervisor: employees[i].supervisor_id,
                    be_evaluated_department_id: employees[i].department_id,
                    evaluated: [],
                    be_evaluated_completed: false,
                    evaluated_all_completed: false,
                    supervisor_check: "N",
                    supervisor_opinion: ""
                });
            }
        }
        res.send(myObject);
        console.log(myObject);

    }catch(err){
        //next(errorHandler.DATA_NOT_FOUND);
        employees = await Employee.find({});
        for(i = 0 ; i < employees.length; i++){
            if(employees[i].situation === "Y"){
                myObject.push({project_id: req.body.project_id,        
                    be_evaluated_id: employees[i]._id,
                    be_evaluated_name: employees[i].name,
                    be_evaluated_job_no: employees[i].job_no,
                    be_evaluated_supervisor: employees[i].supervisor_id,
                    be_evaluated_department_id: employees[i].department_id,
                    evaluated: [],
                    be_evaluated_completed: false,
                    evaluated_all_completed: false,
                    supervisor_check: "N",
                    supervisor_opinion: ""
                });
            }
        }
        res.send(myObject);
        return;
    }
};

const HRUpdateEvaluationList = async (req,res,next) => {

    EvaluationList.remove({project_id: req.body.project_id, be_evaluated_id: req.body.be_evaluated_id}, (err, evaluationList) => {
        if(err){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }else{
            
            if(checkNil(req.body, 7, ["evaluated"])){
                next(errorHandler.FAIL);
                return;
            }

            console.log(req.body);

            let evaluationList = new EvaluationList({
                project_id: req.body.project_id,
                be_evaluated_id: req.body.be_evaluated_id,
                evaluated: JSON.parse(req.body.evaluated),
                be_evaluation_completed: req.body.be_evaluation_completed,
                evaluated_all_completed: req.body.evaluated_all_completed,
                supervisor_check: req.body.supervisor_check,
                supervisor_opinion: req.body.supervisor_opinion
            });
            evaluationList.save().then(() => {
                res.send(evaluationList);
            });
        };
    });
};

const getAllSecondStatusMembers = async (req,res,next) => {
    let evaluationList;

    evaluationList = await EvaluationList.find({project_id: req.body.project_id}).populate("evaluated.evaluated_id");
    //console印不出所有的東西 但是用 res.send就會看到
    
    var myObject = [];
    let counter = {};

    //res.send(evaluationList);

    for(i = 0 ; i < evaluationList.length ; i++){
        for(j = 0; j < evaluationList[i].evaluated.length; j++){
            let evaluatedTmp = evaluationList[i].evaluated[j];

            //console.log(evaluatedTmp.evaluated_id);
            if(evaluatedTmp.evaluated_id === null){
                continue;
            }
            //這邊改用宣告物件的方法 p.s思考問題的方式是資料結構五大總裡面的map(用KEY去找資料最快) 但是js沒有map這個方法 實現的方式是宣告物件(上網找)
            if(evaluatedTmp.evaluated_id._id in counter){               
                counter[evaluatedTmp.evaluated_id._id].total += 1
                counter[evaluatedTmp.evaluated_id._id].finished += (evaluatedTmp.evaluation_completed)?1:0
                counter[evaluatedTmp.evaluated_id._id].unfinished += (!evaluatedTmp.evaluation_completed)?1:0;
                continue;
            }
            counter[evaluatedTmp.evaluated_id._id] = {total: 1,
                finished: (evaluatedTmp.evaluation_completed)?1:0,
                unfinished: (!evaluatedTmp.evaluation_completed)?1:0};
                
            myObject.push({
                name: evaluatedTmp.evaluated_id.name,
                employee_job_no: evaluatedTmp.evaluated_id.job_no,
                employee_id: evaluatedTmp.evaluated_id._id,
                department_id: evaluatedTmp.evaluated_id.department_id,
                count: counter[evaluatedTmp.evaluated_id._id]
            });
        }
    }
    //console.log(counter);
    //res.send(myObject);
    var employees;
    employees = await Employee.find({});

    for(i = 0 ; i <employees.length; i++){
        //console.log(employees[i]);
        let checker = false;
        for(j = 0 ; j < myObject.length; j++){
            if(String(employees[i]._id) === String(myObject[j].employee_id)){
                //console.log(employees[i]);
                checker = true;
                break;
            }
        }
        if(checker){
            continue;
        }
        if(employees[i].situation === "Y"){
            myObject.push({
                name: employees[i].name,
                employee_job_no: employees[i].job_no,
                employee_id: employees[i]._id,
                department_id: employees[i].department_id,
                count: {
                    total: 0,
                    finished: 0,
                    unfinished: 0
                }
            });
        }
    }
    res.send(myObject);
}

const getSecondStatus_be_evaluated = async(req,res,next) => {
    
    try{
        evaluationList = await EvaluationList.find({project_id: req.body.project_id, evaluated:{$elemMatch:{evaluated_id: req.body.evaluated_id}}}).populate("be_evaluated_id");
    }catch(err){
        next(errorHandler.FAIL);
        return;
    }
    console.log(evaluationList.length);
    let arr = [];

    for(i = 0 ; i < evaluationList.length; i++){
        for(j = 0; j <  evaluationList[i].evaluated.length; j++){
            if(evaluationList[i].evaluated[j].evaluated_id == req.body.evaluated_id){
                var evaluated_finished = Boolean;
                evaluated_finished = evaluationList[i].evaluated[j].evaluation_completed
            }
        }
        if(evaluationList[i].be_evaluated_id === null){
            continue;
        }
        arr.push({
            be_evaluated_id: evaluationList[i].be_evaluated_id._id,
            be_evaluated_name: evaluationList[i].be_evaluated_id.name,
            be_evaluated_department_id: evaluationList[i].be_evaluated_id.department_id,
            evaluated_finished: evaluated_finished
        })
    }

    res.send(arr);

    // evaluationList = await EvaluationList.find({project_id: req.body.project_id }).populate("evaluated.evaluated_id");
    // var myObj = [];
    // for(i = 0 ; i < evaluationList.length; i++){
    //     for(j = 0 ; j <evaluationList[i].evaluated.length; j++){
    //         //includes() 方法會判斷陣列是否包含特定的元素，並以此來回傳 true 或 false  但是不能比對物件
    //         if(myObj.includes(evaluationList[i].evaluated[j].evaluated_id._id)){
    //             continue;
    //         }
    //         myObj.push(
    //             evaluationList[i].evaluated[j].evaluated_id._id
    //         );
    //     }
    // }
}

module.exports = {
    updEvaluationList,
    getList,
    getSubEvaluationList,
    updSubEvaluationListStatus,
    //----李彥霖----
    addEvaluationList,
    getEvaluationLists,
    getAllFirstStatus,
    HRUpdateEvaluationList,
    getAllSecondStatusMembers,
    getSecondStatus_be_evaluated,
    getProject_status
    //----李彥霖----
}