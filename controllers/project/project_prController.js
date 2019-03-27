const errorHandler = require("../../utils/errorHandler");
const Project_pr = require("../../models/project_pr");
const checkNil = require("../../utils/nullChecker");
const Project = require("../../models/project");


const addProject_pr = (req,res,next) => {
    if(checkNil(req.body, 4, ["pr_id","topic_id"])){
        next(errorHandler.FAIL);
        return;
    }

    Project.findOne({project_id: req.body.project_id}, (err, project) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }

        Project_pr.find({}).sort({"pr_id": -1}).limit(1).exec((err, result) => {
            if(err){
                next(err);
                return;
            }
            if(result.length>0){
                maxBillboardNo = parseInt(result[0].pr_id);
            }else if(result.length === 0){
                maxBillboardNo = 0;
            }

            let project_pr = new Project_pr({
                project_id: project,
                pr_id: maxBillboardNo + 1,
                topic_id: [req.body.topic_id],
                pr_avg: req.body.pr_avg,
                company_num: req.body.company_num
            });
    
            project_pr.save().then(() => {
                res.send(project_pr);
            });
        });
    });
};

const deleteProject_pr = (req,res,next) => {
    Project_pr.remove({pr_id: req.body.pr_id}, (err,project_pr) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project_pr){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(project_pr.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    });
};

const updateProject_pr = (req,res,next) => {

    Project_pr.update({pr_id: req.body.pr_id}, {$set: {
        topic_id: [req.body.topic_id],
        pr_avg: req.body.pr_avg,
        company_num: req.body.company_num
    }}, (err,project_pr) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!project_pr){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(project_pr.n === 0){
                next(errorHandler.DATA_NOT_FOUND);
                return;
            }
            res.send(project_pr);
    });
};

const getProject_pr = (req,res,next) => {
    Project_pr.findOne({pr_id: req.body.pr_id}, (err,project_pr) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project_pr){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(project_pr);
    });
};

const getProject_prs = (req,res,next) => {
    Project_pr.find({}, (err,project_prs) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(project_prs);
    });
}

module.exports = {
    addProject_pr,
    deleteProject_pr,
    updateProject_pr,
    getProject_pr,
    getProject_prs
};