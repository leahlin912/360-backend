const errorHandler = require("../../utils/errorHandler");
const Project = require("../../models/project");
const checkNil = require("../../utils/nullChecker");

const addProject = async (req,res,next) => {
    console.log(req.body);
    if(checkNil(req.body, 7 ,["evaluation_date_start","evaluation_date_end","project_date_start","project_date_end","topic_id"])){
        next(errorHandler.FAIL);
        return;
    }

    let project = new Project({
        name: req.body.name,
        evaluation_date_start: req.body.evaluation_date_start,
        evaluation_date_end: req.body.evaluation_date_end,
        project_date_start: req.body.project_date_start,
        project_date_end: req.body.project_date_end,
        topic_id: (req.body.topic_id === "")?[]:req.body.topic_id.split(","),       //用三元運算子解決傳進來的參數如果是空值的問題
        close: req.body.close,
        //report_template_id: req.body.report_template_id
    });

    try{
        await project.save();
        res.send(project);
    }catch(err){
        next(errorHandler.FAIL);
    }

    // project.save().then(() => {
    //     res.send(project);
    // }).catch((err) => {
    //     next(errorHandler.FAIL);
    // });

    //project.project_code = project._id;     //Oid會在new Porject的時候產生  所以在這邊再存起來save()  如果未來需要使用自己的id把這一行拿掉就可以了



};

const deleteProject = (req,res,next) => {

    Project.remove({_id: req.params._id}, (err, project) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(project.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    });
}

const updateProject = (req,res,next) => {
    console.log(req.body);
    Project.findOneAndUpdate({_id: req.body._id},
        {$set:{
        name: req.body.name,
        evaluation_date_start: req.body.evaluation_date_start,
        evaluation_date_end: req.body.evaluation_date_end,
        project_date_start: req.body.project_date_start,
        project_date_end: req.body.project_date_end,
        topic_id: (req.body.topic_id === "")?[]:req.body.topic_id.split(","),
        close: req.body.close,
        }}, (err, project) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!project){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(project.n === 0){
                next(errorHandler.DATA_NOT_FOUND);
                return;
            }
            Project.findOne({_id: project._id}, (err,result) => {
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else{
                    res.send(result);
                }
            });
        });
};

const getProject = (req, res, next) => {        //用專案名稱取得
    console.log(req.body);
    Project.findOne({_id: req.body._id}).populate("topic.topic_id").exec((err, project) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
                return;
        }else{
            res.send(project);
        }
    });

};

const getProjects = (req,res,next) => {
    Project.find({}, (err, projects) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(projects);
    });
}

//.findOne({屬性: 對應名稱}) 是去找到那一個專案
//.find({屬性: 對應名稱})   去找到很多專案
//.populate("對應的ref")    在使用的時候去抓到這一個專案裡面有的Topic Oid 如果有複數個就會是一個array形式的topic實體

module.exports = {
    addProject,
    deleteProject,
    updateProject,
    getProject,
    getProjects
}