const errorHandler = require("../../utils/errorHandler");
const Project_emp_status = require("../../models/project_emp_status");
const checkNil = require("../../utils/nullChecker");
const Project = require("../../models/project");
const Employee = require("../../models/employee");

const addProject_emp_status = (req,res,next) => {
    if(checkNil(req.body, 6 , ["evaluation_close_date", "project_close_date"])){
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
        Employee.findOne({employee_id: req.body.employee_id}, (err,employee) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!employee){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }
            let project_emp_status = new Project_emp_status({
                project_id: project,
                employee_id: employee,
                evaluation_close: req.body.evaluation_close,
                evaluation_close_date: req.body.evaluation_close_date,
                project_close: req.body.project_close,
                project_close_date: req.body.project_close_date
            });

            project_emp_status.save().then(() => {
                res.send(project_emp_status);
            });
        });
    });
};

const updateProject_emp_status = (req,res,next) => {
    Project.findOne({project_id: req.body.project_id}, (err,project) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!project){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
    
        Employee.findOne({employee_id: req.body.employee_id}, (err,employee) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!employee){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }
            
            Project_emp_status.update({project_id: project, employee_id: employee}, {$set: {
                evaluation_close: req.body.evaluation_close,
                //evaluation_close_date: req.body.evaluation_close_date,
                project_close: req.body.project_close,
                //project_close_date: req.body.project_close_date
            }}, (err, project_emp_status) => {
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else if(!project_emp_status){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else if(project_emp_status.n === 0){
                    next(errorHandler.DATA_NOT_FOUND);
                    return;
                }
                res.send(project_emp_status);
            });
        });
    });
}

module.exports = {
    addProject_emp_status,
    updateProject_emp_status
}