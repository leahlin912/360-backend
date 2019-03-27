//測試假資料
const getCurrentTime = require('../utils/getCurrentTime');
const Employee = require('../models/employee');
const Project = require('../models/project');
const EvaluationList =require('../models/evaluation_list');
const ProTopicRes = require('../models/pro_topic_res');
const Project_PR = require('../models/project_pr');
const Topic = require('../models/topic');
const Parameter = require('../models/parameter');

let enterpriseID = "5c36ae12ab713d3d144a3d81";
let engDepartmentID = "5c529ff8499c79494c0d2926";
let hrDepartmentID = "5c36afbaf7e5583364fe9619";
//領導力,正向影響力,專業能力
let abilityId = ['5c47edb6f25b887dec9ec260','5c50261028743a7ea77efb5f','5c524a2e39ae1624e8fd428e'];
let reg = '10701';
let nameReg = 'dylan'
let PROJECT_NAME = "2018上半年評量"; 
let TOPIC_REG = 'topic' ;
let findPro;
let proId;
let isEmp;
	
module.exports = {
    addSetupTestData:async (req,res,next)=>{
        //find pro 
        let findProFunc = async () => { 
            console.log('Find_Pro');
            findPro = await Project.findOne({name:PROJECT_NAME});
            if(findPro)
                proId = findPro._id;
            console.log('find pro id => ' + proId); 
        };
        
        //-------------------------------delete date-------------------------------
        //employee
        let delEmp = async () =>{
            let where = {account: new RegExp(reg)};
            let delEmp1 = await Employee.find(where);
            if(delEmp1.length == 10) {
                isEmp = true;
            }else{
                isEmp = false;
            }
            console.log('isEmp ==> ' + isEmp);
            if(isEmp) return;

            console.log('Del_Emp');
            await Employee.deleteMany(where);  
            console.log('Del_Emp--Completed');   
        };

        //pro_topic_res 專案題目回應檔
        let delProTopicRes = async () => {
            if(!proId) return;
            console.log('Del_Pro_topic_res');
            let findProTopicRes = await ProTopicRes.find({project_id:proId});
    
            if(findProTopicRes){
                await ProTopicRes.deleteMany({project_id:proId}); 
                console.log('Del_Pro_topic_res--Completed'); 
            }
        };

        //evaluation_list 專案評量關係人
        let delEvaList = async () => {
            if(!proId) return;
            console.log('Del_EvaList');
            let findEva = await EvaluationList.find({project_id:proId});
  
            if(findEva){
                await EvaluationList.deleteMany({project_id:proId}); 
                console.log('Del_EvaList--Completed'); 
            }
        };
  
        //project 專案檔
        let delPro = async () => {
            if(proId) return;
            console.log('Del_Pro');
            await Project.deleteMany({name:PROJECT_NAME}); 
            console.log('Del_Pro--Completed'); 
        };

        //project_pr	專案PR值統計檔
        let delProject_PR = async () => {
            if(!proId) return;
            console.log('Del_Project_PR');
            let findProject_PR = await Project_PR.find({project_id:proId});
  
            if(findProject_PR){
                await Project_PR.deleteMany({project_id:proId}); 
                console.log('Del_Project_PR--Completed'); 
            }
        };

        //topic	360題目檔
        let delTopic = async () => {
            console.log('Del_Topic');
            let findTopic = await Topic.find({topic_code:new RegExp(TOPIC_REG)});
            if(findTopic){
                await Topic.deleteMany({topic_code:new RegExp(TOPIC_REG)}); 
                console.log('Del_Topic--Completed');
            }          
        };

        //-------------------------------insert date-------------------------------
        //add emp
        let addEmp = async () => {
            if(isEmp) return;
            console.log('Add_Emp');
            let supervisor_id;
            for(let i=1;i<=10;i++){
                let tmp;
                let position = 1;
                let job_title ='工程師';
                let email= 'lhuim2038@gmail.com';

                tmp = (i<10) ? reg + '0' + i : reg + i;
                console.log(tmp);
                
                //主管
                if(i==1){
                    position = 2 ;
                    job_title = '工程部經理';
                    email = 'lhuim2039@gmail.com';
                }
                    
                await new Employee({
                    enterprise_id:enterpriseID,
                    department_id:engDepartmentID,
                    account:tmp,
                    password:tmp,
                    job_no:tmp,
                    name:nameReg+i,
                    position:position,
                    job_title:job_title,
                    situation:'Y',
                    supervisor_id:supervisor_id,
                    due_date : getCurrentTime(),
                    res_date:"",
                    phone_number:'0912345678',
                    address:'taipei',
                    email:email,
                    purview:[]
                })
                .save();

                if(i==1)
                    supervisor_id = await Employee.findOne({
                        account:tmp
                    }).exec();
            };
            console.log('Add_Emp--Completed');
        };

        //add topic	360題目檔
        //領導力,正向影響力,專業能力
        let addTopic = async () => {
            console.log('Add_Topic');
           
            //正向影響力
            await new Topic({
                topic_code:TOPIC_REG+'01',
                applicable_dep_id:null,
                type:1,
                ability_id:abilityId[1],   
                content:'這半年你做過對公司最有正向影響力的事情是什麼？', 
                option:''
            }).save();
            
            await new Topic({
                topic_code:TOPIC_REG+'02',
                applicable_dep_id:null,
                type:1,
                ability_id:abilityId[1],   
                content:'這件事情當初你是如何想到的？以及如何完成的？', 
                option:''
            }).save();

            await new Topic({
                topic_code:TOPIC_REG+'03',
                applicable_dep_id:null,
                type:3,
                ability_id:abilityId[1],   
                content:'選擇題測試', 
                option:['1.res1','1.res2','1.res3']
            }).save();

            await new Topic({
                topic_code:TOPIC_REG+'04',
                applicable_dep_id:null,
                type:2,
                ability_id:abilityId[1],   
                content:'分數(1~5分)', 
                option:''
            }).save();

            //領導力
            await new Topic({
                topic_code:TOPIC_REG+'05',
                applicable_dep_id:null,
                type:3,
                ability_id:abilityId[0],   
                content:'若你成為leader，同事願意跟隨你的意願有多高?為什麼?', 
                option:''
            }).save();

            await new Topic({
                topic_code:TOPIC_REG+'06',
                applicable_dep_id:null,
                type:2,
                ability_id:abilityId[0],   
                content:'分數(1~5分)', 
                option:''
            }).save();

            //工程專業能力
            await new Topic({
                topic_code:TOPIC_REG+'07',
                applicable_dep_id:engDepartmentID,
                type:1,
                ability_id:abilityId[2],   
                content:'工程專業能力', 
                option:''
            }).save();

            await new Topic({
                topic_code:TOPIC_REG+'08',
                applicable_dep_id:engDepartmentID,
                type:2,
                ability_id:abilityId[2],   
                content:'分數(1~5分)', 
                option:''
            }).save();

            //人資專業能力
            await new Topic({
                topic_code:TOPIC_REG+'09',
                applicable_dep_id:hrDepartmentID,
                type:1,
                ability_id:abilityId[2],   
                content:'人資專業能力', 
                option:''
            }).save();

            await new Topic({
                topic_code:TOPIC_REG+'10',
                applicable_dep_id:hrDepartmentID,
                type:2,
                ability_id:abilityId[2],   
                content:'分數(1~5分)', 
                option:''
            }).save();
            
            console.log('Add_Topic--Completed');
        }

        //add pro 專案
        let addPro = async() => {
            if(proId) {
                console.log('upd_Pro_topics');
                let topics = await Topic.find({topic_code:new RegExp(TOPIC_REG)},{_id:1}).sort({topic_code:1});
                await Project.updateOne({_id:proId},{$set:{topic_id:topics}});
                console.log('upd_pro_topics--Completed');
                return;
            };
            
            console.log('Add_Pro');
            let findTopic = await Topic.find({topic_code:new RegExp(TOPIC_REG)},{_id:1}).sort({topic_code:1});
            
            let topic = [];
            if(findTopic){
                for(let i=0; i<findTopic.length; i++){
                    topic.push(findTopic[i]._id);
                }
            }
            console.log(topic);
            
            await new Project({
                name:PROJECT_NAME,	
                evaluation_date_start:"2018/04/01",
                evaluation_date_end:"2018/05/31",	
                project_date_start:"2018/06/01",
                project_date_end:"2018/06/30",
                topic_id:topic,	
                close:"N"
            }).save();
            console.log('Add_Pro--Completed');
            proId = await Project.findOne({name:PROJECT_NAME});
            if(proId)
                console.log('Create new project , id => ' + proId._id);

            //設定參數目前運行專案
            // await Parameter.updateOne({},{$set:{current_project_id:proId}});
            // console.log("upd Current_project_id!")
        };

        //add eva 專案關係人1
        let addEvaList = async () => {
            console.log('Add_EvaList');
            let findEmp ;
            if(!proId) return;
            
            findEmp = await Employee.find({account: new RegExp(reg)}).sort({account:1});
            if(!findEmp){
                console.log('newEmp is empty');
                return;
            };
        
            console.log("1070102 id => " + findEmp[1]._id);
            let evaluated = [];
            
            for(let j=2,h=0;j<=3;j++,h++){
                await evaluated.push({
                    evaluated_id:findEmp[j]._id,
                    relation:'2',
                    evaluation_completed:false
                });
            }

            await new EvaluationList({
                project_id:proId,
                be_evaluated_id:findEmp[1]._id,
                evaluated:evaluated,
                be_evaluation_completed:false,
                evaluated_all_completed:false,
                supervisor_check:'Y',
                supervisor_opinion:'無'
            })
            .save().then(console.log('Add_EvaList--Completed')); 

            //pro_topic_res 專案題目回應檔
            let findTopic = await Topic.find(
                                {$and:[
                                    {topic_code:new RegExp(TOPIC_REG)},
                                    {$or:[{applicable_dep_id:null},{applicable_dep_id:engDepartmentID}]}
                                ]})
                                .sort('topic_code').exec();
              
            if(findTopic){
                //1070103        
                await new ProTopicRes({
                    project_id:proId,
                    be_evaluated_id:findEmp[1]._id,
                    evaluated_id:findEmp[2]._id,
                    result_anonymous:false,
                    topic:[
                        //正向影響力4題
                        {topic_id:findTopic[0]._id,
                            topic_res:"有規劃性的一步一步完成財報與原物料的承接，並且去思考如何驗證龐大的欄位以及加速驗證的效率。",
                            topic_score:0},

                        {topic_id:findTopic[1]._id,
                            topic_res:"認真學習每一次的交接會議，與交接者討論如何承接。",
                            topic_score:0},

                        {topic_id:findTopic[2]._id,
                            topic_res:"1.res1",
                            topic_score:0},

                        {topic_id:findTopic[3]._id,
                            topic_res:"",
                            topic_score:5},

                        //領導力2題
                        {topic_id:findTopic[4]._id,
                            topic_res:"心思細膩，有自己的見解與規劃，可歸納多種建議後下決策，與成員溝通良好，思考較謹慎，適合專案規劃安排。",
                            topic_score:0},

                        {topic_id:findTopic[5]._id,
                            topic_res:"",
                            topic_score:4},
                        
                        //專業能力2題
                        {topic_id:findTopic[6]._id,
                            topic_res:"專業能力回答1",
                            topic_score:0},

                        {topic_id:findTopic[7]._id,
                            topic_res:"",
                            topic_score:4}
                    ],
                    suggest:"1.繼續保持細心謹慎的特質，優化重複性工作項目2.適時表現更有自信的一面3.主動分享與協助其他成員"
                }).save();

                //1070104
                await new ProTopicRes({
                    project_id:proId,
                    be_evaluated_id:findEmp[1]._id,
                    evaluated_id:findEmp[3]._id,
                    result_anonymous:true,
                    topic:[
                        //正向影響力4題
                        {topic_id:findTopic[0]._id,
                            topic_res:"接下財報與原物料",
                            topic_score:0},

                        {topic_id:findTopic[1]._id,
                            topic_res:"是需求，並透過她有效率的安排吸收，結合來臨的業務需求，順利承接下來",
                            topic_score:0},

                        {topic_id:findTopic[2]._id,
                            topic_res:"2.res2",
                            topic_score:0},

                        {topic_id:findTopic[3]._id,
                            topic_res:"",
                            topic_score:4},

                        //領導力2題
                        {topic_id:findTopic[4]._id,
                            topic_res:"擁有找出錯誤的眼光",
                            topic_score:0},

                        {topic_id:findTopic[5]._id,
                            topic_res:"",
                            topic_score:4},
                        
                        //專業能力2題
                        {topic_id:findTopic[6]._id,
                            topic_res:"專業能力回答2",
                            topic_score:0},

                        {topic_id:findTopic[7]._id,
                            topic_res:"",
                            topic_score:4}
                    ],
                    suggest:"不僅僅要有找出錯誤的眼光，還要有縱橫整體，帶領全組的想法與實踐"
                }).save();

                //人資--pro_topic_res 專案題目回應檔
                findTopic = await Topic.find(
                    {$and:[
                        {topic_code:new RegExp(TOPIC_REG)},
                        {$or:[{applicable_dep_id:null},{applicable_dep_id:hrDepartmentID}]}
                    ]})
                    .sort('topic_code').exec();

                if(findTopic){
                //人資人員        
                await new ProTopicRes({
                project_id:proId,
                be_evaluated_id:"5c483172d473871f3158841d",
                evaluated_id:"5c4831dbd473871f3158841e",
                result_anonymous:false,
                topic:[
                    //正向影響力4題
                    {topic_id:findTopic[0]._id,
                        topic_res:"有規劃性的一步一步完成財報與原物料的承接，並且去思考如何驗證龐大的欄位以及加速驗證的效率。",
                        topic_score:0},

                    {topic_id:findTopic[1]._id,
                        topic_res:"認真學習每一次的交接會議，與交接者討論如何承接。",
                        topic_score:0},

                    {topic_id:findTopic[2]._id,
                        topic_res:"1.res1",
                        topic_score:0},

                    {topic_id:findTopic[3]._id,
                        topic_res:"",
                        topic_score:3},

                    //領導力2題
                    {topic_id:findTopic[4]._id,
                        topic_res:"心思細膩，有自己的見解與規劃，可歸納多種建議後下決策，與成員溝通良好，思考較謹慎，適合專案規劃安排。",
                        topic_score:0},

                    {topic_id:findTopic[5]._id,
                        topic_res:"",
                        topic_score:2},
                    
                    //專業能力2題
                    {topic_id:findTopic[6]._id,
                        topic_res:"專業能力回答1",
                        topic_score:0},

                    {topic_id:findTopic[7]._id,
                        topic_res:"",
                        topic_score:3}
                        ],
                        suggest:"1.繼續保持細心謹慎的特質，優化重複性工作項目2.適時表現更有自信的一面3.主動分享與協助其他成員"
                        }).save();

                    }

                console.log('Add_ProTopicRes--Completed')
            }
        };    
        
        //add eva 專案關係人2
        let addEvaList2 = async () => {
            console.log('Add_EvaList2');
            let findEmp ;
            if(!proId) return;
            
            findEmp = await Employee.find({account: new RegExp(reg)}).sort({account:1});
            if(!findEmp){
                console.log('newEmp2 is empty');
                return;
            };
        
            console.log("1070103 id => " + findEmp[2]._id);
            let evaluated = [];
            
            for(let j=3,h=0;j<=3;j++,h++){
                await evaluated.push({
                    evaluated_id:findEmp[j]._id,
                    relation:'2',
                    evaluation_completed:false
                });
            }

            await new EvaluationList({
                project_id:proId,
                be_evaluated_id:findEmp[2]._id,
                evaluated:evaluated,
                be_evaluation_completed:false,
                evaluated_all_completed:false,
                supervisor_check:'Y',
                supervisor_opinion:'無'
            })
            .save().then(console.log('Add_EvaList2--Completed')); 

            //pro_topic_res 專案題目回應檔
            let findTopic = await Topic.find(
                                {$and:[
                                    {topic_code:new RegExp(TOPIC_REG)},
                                    {$or:[{applicable_dep_id:null},{applicable_dep_id:engDepartmentID}]}
                                ]})
                                .sort('topic_code').exec();
              
            if(findTopic){
                //1070104        
                await new ProTopicRes({
                    project_id:proId,
                    be_evaluated_id:findEmp[2]._id,
                    evaluated_id:findEmp[3]._id,
                    result_anonymous:false,
                    topic:[
                        //正向影響力4題
                        {topic_id:findTopic[0]._id,
                            topic_res:"Test2--有規劃性的一步一步完成財報與原物料的承接，並且去思考如何驗證龐大的欄位以及加速驗證的效率。",
                            topic_score:0},

                        {topic_id:findTopic[1]._id,
                            topic_res:"Test2--認真學習每一次的交接會議，與交接者討論如何承接。",
                            topic_score:0},

                        {topic_id:findTopic[2]._id,
                            topic_res:"1.res1--Test2",
                            topic_score:0},

                        {topic_id:findTopic[3]._id,
                            topic_res:"",
                            topic_score:5},

                        //領導力2題
                        {topic_id:findTopic[4]._id,
                            topic_res:"Test2--心思細膩，有自己的見解與規劃，可歸納多種建議後下決策，與成員溝通良好，思考較謹慎，適合專案規劃安排。",
                            topic_score:0},

                        {topic_id:findTopic[5]._id,
                            topic_res:"",
                            topic_score:4},
                        
                        //專業能力2題
                        {topic_id:findTopic[6]._id,
                            topic_res:"Test2--專業能力回答1",
                            topic_score:0},

                        {topic_id:findTopic[7]._id,
                            topic_res:"",
                            topic_score:4}
                    ],
                    suggest:"Test2--1.繼續保持細心謹慎的特質，優化重複性工作項目2.適時表現更有自信的一面3.主動分享與協助其他成員"
                }).save();

                console.log('Add_ProTopicRes--Completed')
            }
        };    

        //-------------------------------run function-------------------------------
        await console.log('--------------------------');
        await findProFunc(); //找 pro id
        await console.log('--------------------------');
        await delEmp();//員工
        await console.log('--------------------------');
        await delProTopicRes();
        await console.log('--------------------------');
        await delEvaList();//關係人
        await console.log('--------------------------');  
        await delPro();  
        await console.log('--------------------------'); 
        await delProject_PR(); 
        await console.log('--------------------------'); 
        await delTopic();  


        await console.log('--------------------------');
        await addEmp();  
        await console.log('--------------------------'); 
        await addTopic();
        await console.log('--------------------------'); 
        await addPro();
        await console.log('--------------------------'); 
        await addEvaList();
        await console.log('--------------------------'); 
        await addEvaList2();
        // await console.log('--------------------------'); 
        // await addProPR();
        await console.log('--------------------------');    
        await console.log('setup test data completed');

        res.send("Setup Test Data!");
        return;
    }
}