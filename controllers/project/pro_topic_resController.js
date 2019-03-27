const errorHandler = require("../../utils/errorHandler");
const Pro_topic_res = require("../../models/pro_topic_res");
const checkNil = require("../../utils/nullChecker");
const Project = require("../../models/project");
const Employee = require("../../models/employee");

const addPro_topic_res = (req,res,next) => {
    if(checkNil(req.body, 3, [])){
        next(errorHandler.FAIL);
        return;
    }

    Project.findOne({project_id: req.body.project_id}, (err,project) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        Employee.findOne({employee_id: req.body.be_evaluated_id}, (err,employeeA) => {      //受評人
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!employeeA){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }

            Employee.findOne({employee_id: req.body.evaluated_id}, (err,employeeB) => {      //評量人
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else if(!employeeB){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }

                let pro_topic_res = new Pro_topic_res({
                    project_id: project,
                    be_evaluated_id: employeeA,
                    evaluated_id: employeeB,
                    topic: [{topic_id: req.body.topic_id, topic_res: req.body.topic_res, topic_score: req.body.topic_score}]
                });
    
                pro_topic_res.save().then(() => {
                    res.send(pro_topic_res);
                });
            });
        });
    });
};

//取得登入者評量過的專案清單
const getHistoricalProject = async (req,res,next) => {
    let user_id = req.params.user_id;
    let proTopicResProIds = [];
    let findHisProTopicResToProId;
    let hisPro;

    if(checkNil(req.params, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    findHisProTopicResToProId = await Pro_topic_res.find({be_evaluated_id:user_id},{_id:0,project_id:1});

    if(findHisProTopicResToProId.length == 0){
        next(errorHandler.DATA_NOT_FOUND);
        return;
    }

    proTopicResProIds = findHisProTopicResToProId.map(function (value, index, array) {
        return value.project_id;
    })

    hisPro = await Project.find({_id:{$in:proTopicResProIds}}).sort({evaluation_date_start:-1});
    res.send(hisPro);
}

module.exports = {
    addPro_topic_res,
    getHistoricalProject
}