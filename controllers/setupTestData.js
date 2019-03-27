//測試假資料
const getCurrentTime = require('../utils/getCurrentTime');
const Employee = require('../models/employee');
const Project = require('../models/project');
const EvaluationList =require('../models/evaluation_list');
const ProTopicRes = require('../models/pro_topic_res');
// const Employee_pr = require('../models/employee_pr');
const Project_PR = require('../models/project_pr');
const Topic = require('../models/topic');

let enterpriseID = "5c36ae12ab713d3d144a3d81";
let departmentID = "5c36b175654fc53650c02f31";
let reg = 'dylan';
let project_code = "2019_01"; 
let findPro;
let proId;
let newProId;

//增加專案
let addProject = new Project({
    project_code:project_code,
    name:"test_pro",
	description:"test_pro",
	year:"2019",	
	evaluation_date_star:"",
	evaluation_date_end:"",	
	project_date_start:"",
	project_date_end:"",
	topic:"",	
	valid:"Y",
    project_end:"N"
});
	
module.exports = {
    addSetupTestData:async (req,res,next)=>{
        //find pro 
        let findProFunc = async () => { 
            console.log('Find_Pro');
            findPro = await Project.findOne({project_code:project_code});
            if(findPro)
                proId = findPro._id;
            console.log('find pro id => ' + proId); 
        };
        
        //-------------------------------delete date-------------------------------
        //employee
        let delEmp = async () =>{
            console.log('Del_Emp');
            let where = {account: new RegExp(reg)};
            let delEmp1 = await Employee.find(where);
            if(delEmp1){
                await Employee.deleteMany(where);  
                console.log('Del_Emp--Completed');
            }
        };

        //employee _pr	專案員工PR值檔
        // let delEmployeePR = async () => {
        //     console.log('Del_Employee_PR');
        //     let findEmployee_PR;
        //     if(!proId) return;

        //     findEmployee_PR = await Employee_pr.find({project_id:proId});
  
        //     if(findEmployee_PR){
        //         await Employee_pr.deleteMany({project_id:proId}); 
        //         console.log('Del_Employee_PR--Completed'); 
        //     }
        // };

        //pro_topic_res 專案題目回應檔
        let delProTopicRes = async () => {
            console.log('Del_Pro_topic_res');
            let findProTopicRes;
            if(!proId) return;

            findProTopicRes = await ProTopicRes.find({project_id:proId});
    
            if(findProTopicRes){
                await ProTopicRes.deleteMany({project_id:proId}); 
                console.log('Del_Pro_topic_res--Completed'); 
            }
        };

        //evaluation_list 專案評量關係人
        let delEvaList = async () => {
            console.log('Del_EvaList');
            let findEva;
            if(!proId) return;

            findEva = await EvaluationList.find({project_id:proId});
  
            if(findEva){
                await EvaluationList.deleteMany({project_id:proId}); 
                console.log('Del_EvaList--Completed'); 
            }
        };
        
        //project_pr	專案PR值設定檔
        let delProject_PR = async () => {
            console.log('Del_Project_PR');
            let findProject_PR;
            if(!proId) return;

            findProject_PR = await Project_PR.find({project_id:proId});
  
            if(findProject_PR){
                await Project_PR.deleteMany({project_id:proId}); 
                console.log('Del_Project_PR--Completed'); 
            }
        };

        //project 專案檔
        let delPro = async () => {
            console.log('Del_Pro');
            await Project.deleteMany({project_code:project_code}); 
            console.log('Del_Pro--Completed'); 
        };

        //topic	360題目檔
        let delTopic = async () => {
            console.log('Del_Topic');
            let findTopic = await Topic.find({topic_code:new RegExp(reg)});
            if(findTopic){
                await Topic.deleteMany({topic_code:new RegExp(reg)}); 
                console.log('Del_Topic--Completed');
            }          
        };

        //-------------------------------insert date-------------------------------
        //add emp
        let addEmp = async () => {
            console.log('Add_Emp');
            let supervisor_id;
            for(let i=0;i<10;i++){
                let tmp = reg + i;
                await new Employee({
                    enterprise_id:enterpriseID,
                    department_id:departmentID,
                    account:tmp,
                    password:tmp,
                    job_no:tmp,
                    name:tmp,
                    supervisor_id:supervisor_id,
                    due_date : getCurrentTime()
                })
                .save();

                if(i==0)
                    supervisor_id = await Employee.findOne({
                        account:tmp
                    }).exec();
            };
            console.log('Add_Emp--Completed');
        };

        //add topic	360題目檔
        let addTopic = async () => {
            console.log('Add_Topic');
            for(let i=0; i<10; i++){
                await new Topic({
                    topic_code:reg+i,
                    applicable_dep_id:null,
                    type:3,
                    type_des:'test'+i,   
                    content:'test'+i, 
                    option:'',
                    valid:'Y'
                }).save();
            };
            console.log('Add_Topic--Completed');
        }

        //add pro 專案
        let addPro = async() => {
            console.log('Add_Pro');
            await addProject.save();
            console.log('Add_Pro--Completed');
            newProId = await Project.findOne({project_code:project_code});
            if(newProId)
                console.log('Create new project , id => ' + newProId);
        };
        
        // project_pr	專案PR值設定檔	ObjectId	project	project_id	專案代號id	
		// Number		pr_no	PR值編號	
		// Array		pr_item	PR值題目	
		// ObjectId	topic	topic_id	  PR值題目計算項目id	"1.限定專案檔的題目，不可重覆
        //     2.限定分數題"
		// Number		pr_avg	公司PR平均值	
        // Number		company_num	公司人數
        let addProPR = async () => {
            console.log('Add_ProPR');
            if(!newProId) return;

            for(let i=1; i<=2; i++){
                let pr_item = [];
                for(let j=i+1; j<=i+2; j++){
                    let tmp = reg + j;
                    let findTopic = await Topic.findOne({topic_code:tmp}).exec();
                    if(findTopic)
                        pr_item.push(findTopic._id);
                }

                await new Project_PR({
                    project_id:newProId,
                    pr_no:i,
                    pr_item:pr_item,
                    pr_avg:5,
                    company_num:100
                }).save();
            };
            console.log('Add_ProPR--Completed')
        };

        //add eva 專案關係人
        let addEvaList = async () => {
            console.log('Add_EvaList');
            let findEmp ;
            if(!newProId) return;
            
            findEmp = await Employee.find({account: new RegExp(reg)}).sort({account:1});
            if(!findEmp){
                console.log('newEmp is empty');
                return;
            };

            for(let i=0;i<5;i++){
                let evaluated = [];

                for(let j=i+1;j<=i+3;j++){
                    await evaluated.push({
                        evaluated_id:findEmp[j]._id,
                        relation:'1',
                        result_anonymous:false,
                        evaluation_completed:false
                    });

                    //pro_topic_res 專案題目回應檔
                    // pro_topic_res	專案題目回應檔	ObjectId	project	project_id	專案代號id
                    // ObjectId	employee	be_evaluated_id	受評人id
                    // ObjectId	employee	evaluated_id	評量人id
                    // Array		topic	題目
                    // ObjectId	topic	topic_id	  題目編號id
                    // String		topic_res	  題目回應
                    // Number		topic_score	  題目分數 
                    let pr_item = [];
                    for(let k=i+1;k<=i+3;k++){
                        let tmp = reg + k;
                        let findTopic = await Topic.findOne({topic_code:tmp}).exec();
                        if(findTopic)
                            pr_item.push({topic_id:findTopic.id,topic_res:'test',topic_score:3});
                    }
                    await new ProTopicRes({
                        project_id:newProId,
                        be_evaluated_id:findEmp[i]._id,
                        evaluated_id:findEmp[j]._id,
                        topic:pr_item
                    }).save().then(console.log('Add_ProTopicRes--Completed'))
                };

                await new EvaluationList({
                    project_id:newProId,
                    be_evaluated_id:findEmp[i]._id,
                    evaluated:evaluated
                })
                .save().then(console.log('Add_EvaList--Completed')
                ); 

                //employee _pr	專案員工PR值檔
                // employee _pr	專案員工PR值檔	ObjectId	project	project_id	專案代號id
                // 		ObjectId	employee	be_evaluated_id	受評人id
                // 		Array		pr_items	PR值
                // 		ObjectId	project_pr	pr_item_id	  PR值項目id
                // 		Number		pr_value	  PR值
                //         Number		pr_no	  PR值排名
                // let findProPR = await Project_PR.find({project_id:newProId});
                // let pr_items_Arr = [];
                // for(let i in findProPR){
                //     pr_items_Arr.push({pr_item_id:i._id,pr_value:3,pr_no:10});     
                // }
                // await new Employee_pr({
                //     project_id:newProId,   
                //     be_evaluated_id:findEmp[i]._id,
                //     pr_items:pr_items_Arr
                // }).save().then(console.log('Add_EmpPR--Completed'));
            };
        };         

        //-------------------------------run function-------------------------------
        await console.log('--------------------------');
        await findProFunc(); //找 pro id
        await console.log('--------------------------');
        await delEmp();//員工
        await console.log('--------------------------');
        await delEmployeePR();
        await console.log('--------------------------');
        await delProTopicRes();
        await console.log('--------------------------');
        await delEvaList();//關係人
        await console.log('--------------------------'); 
        await delProject_PR(); 
        await console.log('--------------------------');  
        await delPro();  
        await console.log('--------------------------'); 
        await delTopic();  


        await console.log('--------------------------');
        await addEmp();  
        await console.log('--------------------------'); 
        await addTopic();
        await console.log('--------------------------'); 
        await addPro();
        await console.log('--------------------------'); 
        await addProPR();
        await console.log('--------------------------'); 
        await addEvaList();

        await console.log('--------------------------');    
        await console.log('setup test data completed');

        res.send("Setup Test Data!");
        return;
    }
}