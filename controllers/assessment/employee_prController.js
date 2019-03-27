
//const Employee_pr = require("../../models/employee_pr");
const errorHandler = require("../../utils/errorHandler");
const checkNil = require("../../utils/nullChecker");
const Employee = require("../../models/employee");

// const addEmployee_pr = (req,res,next) => {
//     if(checkNil(req.body, 5 , [])){
//         next(errorHandler.FAIL);
//         return;
//     }

//     Project.findOne({project_id: req.body.project_id}, (err, project) => {
//         if(err){
//             next(errorHandler.INTERNAL_DB_ERROR);
//             return;
//         }else if(!project){
//             next(errorHandler.INTERNAL_DB_ERROR);
//             return;
//         }
//         Employee.findOne({employee_id :req.body.be_evaluated_id}, (err, employee) => {
//             if(err){
//                 next(errorHandler.INTERNAL_DB_ERROR);
//                 return;
//             }else if(!employee){
//                 next(errorHandler.INTERNAL_DB_ERROR);
//                 return;
//             }

//             let employee_pr = new Employee_pr({
//                 project_id: project,
//                 be_evaluated_id: employee,
//                 pr_items: [{pr_id: req.body.pr_id, pr_value: req.body.pr_value, pr_no: req.body.pr_no}]
//             });
//             employee_pr.save().then(() => {
//                 res.send(employee_pr);
//             });
//         });
//     });
// };

module.exports = {
    //addEmployee_pr
};