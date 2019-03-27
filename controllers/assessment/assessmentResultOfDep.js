//subject:部門專案評量結果管理
//create:190113
//author:陳冠穎

const errorHandler = require('../../utils/errorHandler');
const getAssessmentResFunc = require('./assessmentResultFunc');
const Employee = require('../../models/employee');
const Project_pr = require('../../models/project_pr');
const checkNil = require('../../utils/nullChecker');

//取得部門專案評量結果
const getAssessmentResultList = async (req,res,next) =>{
    let project_id = req.body.project_id;
    let user_id = req.body.user_id;
    let employeeList = []; //存下屬員工清單
    let resultAssessment = []; //存下屬員工評量結果
    let empListMap = {};

    if(checkNil(req.body, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    }
 
    await Employee.find({$or:[{supervisor_id:user_id},{_id:user_id}]}).sort({job_no:1}).exec( async(err,emps)=>{
        let empIdArr = [];
        let pro_pr;
        let pro_pr2;

        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }

        if(!emps || emps.length==0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        try{
            empIdArr = emps.map((value, index, array)=>{
                employeeList.push(value);
                empListMap[value._id] = 1;
                return value._id;
            });

            pro_pr = await Project_pr.find( 
                {$and:[
                    {project_id: project_id},
                    {'employee_prs.be_evaluated_id':{"$in":empIdArr}}
                ]},
                {
                    project_id:1,department_id:1,ability_id:1,pr_topics:1,pr_avg:1,maxRank:1,minRank:1,distanceRank:1,assessment_num:1 ,
                    employee_prs:1
                }
            ).sort({account:1})
            .populate('project_id')
            .populate('department_id')
            .populate('ability_id')
            .populate('pr_topics')
            .populate('employee_prs.be_evaluated_id')
            .exec();
            
            if(!pro_pr){
                pro_pr = []; 
                pro_pr2 = pro_pr;
            } else{
                pro_pr2 = JSON.parse(JSON.stringify(pro_pr));
            }
            
            for(let i =0; i<pro_pr.length; i++ ){
                pro_pr2[i].employee_prs = [];
                for(let j=0; j<pro_pr[i].employee_prs.length; j++){
                    let empObj = pro_pr[i].employee_prs[j];
                    if(empListMap[empObj.be_evaluated_id._id]){
                        pro_pr2[i].employee_prs.push(empObj);    
                    }
                }
            }

            res.send(
                {
                    employeeList:employeeList,
                    project_pr:pro_pr2
                }
            );
        }catch(e){
            console.log(e.message);
            next(errorHandler.INTERNAL_SERVER_ERROR);
        }
        return;
    });
};

module.exports = {
    getAssessmentResultList
}