//subject:評量報告匯出ejsexcel
//create:190117
//author:陳冠穎

const config = require('../../config/index');
//const ejsExcelExport = require('../../utils/ejsExcelExport');
const checkNil = require("../../utils/nullChecker");
const errorHandler = require('../../utils/errorHandler');
const fs = require("fs");
//const archiver = require('archiver');
//const archive = archiver('zip');
const p = require('path');

const Employee = require('../../models/employee');
const Project = require('../../models/project');
const Project_pr = require('../../models/project_pr');
const EvaluationList = require('../../models/evaluation_list');
const Pro_topic_res = require('../../models/pro_topic_res');

let TITLE_S_STR = '【關於你的'
let TITLE_E_STR = '】'
let TOPIC_STR = 'topic';
let TEMP_FILE_NAME ;
let OUTPUT_FILE_NAME = '_report_file.zip';
let TEMPLATE_EXCEL_PATH ;
let project_obj;    //專案資料
let pro_pr_obj;     //專案pr資料
let projectName;

const exportEjsexcel = async (req,res,next) => {
    let project_id = req.params.project_id;   //專案id
    let be_evaluated_id = req.params.be_evaluated_id; //受評人id
     
    if(checkNil(req.params, 2 ,[])){
        next(errorHandler.FAIL);
        return;
    };

    if(!await getProjectDate(project_id)){
        next(errorHandler.INTERNAL_SERVER_ERROR);
        return;
    }
    
    //匯出資料取得儲存路徑與檔名
    let exportFileObj = await exportReportDataToExcel(project_id,be_evaluated_id);
    //res.send(exportFileObj);return;

    if(exportFileObj == "-1"){
        next(errorHandler.INTERNAL_SERVER_ERROR);
        return;
    }

    try{//下載
        if(isFile(exportFileObj.filePath)){
            res.download(exportFileObj.filePath, exportFileObj.fileName, err => { 
                if (err) {
                    res.send(err);
                } else {
                }
            })
        } else {
            res.send(errorHandler.DATA_NOT_FOUND);
        }
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
    }
}

var exportEjsexcelAll = async (req, res, next) => {
    let project_id = req.params.project_id;

    if(checkNil(req.params, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    };

    try{
        //撈取專案資料
        if(!await getProjectDate(project_id)){
            next(errorHandler.INTERNAL_SERVER_ERROR);
            return;
        }

        //撈取專案關係人資料
        let evaListObjArr = await EvaluationList.find({project_id:project_id}).exec()
        if(!evaListObjArr){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        archive.on('error', function(err) {
            res.status(500).send({error: err.message});
        });

        archive.on('end', function() {
            console.log('Archive wrote %d bytes', archive.pointer());
        });

        //set the archive name
        res.attachment(projectName + OUTPUT_FILE_NAME);
        archive.pipe(res); 

        for(let i=0; i < evaListObjArr.length; i++){
            let be_evaluated_id = evaListObjArr[i].be_evaluated_id;

            //撈取專案回應檔
            let pro_topic_res_Arr = await Pro_topic_res.find({$and:[
                    {project_id:project_id},
                    {be_evaluated_id:be_evaluated_id}
                ]});
            
            if(!pro_topic_res_Arr) continue;
            
            let exportFileObj = await exportReportDataToExcel(project_id,be_evaluated_id);

            if(exportFileObj == "-1") continue;

            if(isFile(exportFileObj.filePath)) 
                archive.file(exportFileObj.filePath, { name: p.basename(exportFileObj.filePath) });      
        }

        archive.finalize();
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
    }
}

async function exportReportDataToExcel(project_id,be_evaluated_id){
    let dataObj = await getData(project_id,be_evaluated_id); //取得匯入excel資料
    //return dataObj;
    if(dataObj.success){
        let fileName = dataObj.exportFileName + '.xlsx';
        await ejsExcelExport(TEMPLATE_EXCEL_PATH, config.EXPORT_PATH, fileName, dataObj.data);
        let filePath = config.EXPORT_PATH+'/'+fileName;
        
        return {fileName:fileName,filePath:filePath};
    }else{
        return "-1";
    }
}

async function getData(project_id, emp_id){
    //data架構
    // [ 
    //     [{"report_title":"2018上半年度","employee_name": '洪二二'}], 
    //     [{"pr_title":"【關於你的正向影響力】","pr_value_str":"4.67/3.84(10)","type":"2",
    //             "topic1":"這半年你做過對公司最有正向影響力的事情是什麼？",
    //             "topic2":"這件事情當初你是如何想到的？以及如何完成的？",
    //             "res":[
    //                 {"topic1_res":"有規劃性的一步一步完成財報與原物料的承接。",
    //                  "topic2_res":"認真學習每一次的交接會議，與交接者討論如何承接。",
    //                  "pr_score":5}]},
    //         {"pr_title":"【關於你的領導力】","pr_value_str":"4/2.93(10)","type":"1",
    //             "topic1":"若你成為leader，同事願意跟隨你的意願有多高?為什麼?",
    //             "res":[{"topic1_res":"心思細膩，有自己的見解與規劃。","pr_score":4}]}
    //     ],
    //     [{"suggest_title":"【同事們想給你的建議】",
    //         "suggest_des":"同事建議內容",
    //         "res":[{"suggest_res":"做事沉穩、條理分明"}]
    //     }]
    // ];	

    //{sussess:T/F,exportFileName:'2018上半年度_1070102_dylan',data:[]}
    let result = {
        success:false,
        message:'',
        exportFileName:'',
        data:[]
    };
    let data = [];
    let dataForPrArr = [];  //for data的 pr 回應 Arr
    let dataForSuggestArr = [];//for data的 同事建議 回應 Arr
    let employee_obj;
    let pro_topic_res_Arr;
    let suggest_obj = {}; //同事建議obj
    let suggest_res_arr = []; //每個同事建議

    try{
        //1.取得專案、專案pr平均值資料
        if(!project_obj){
            project_obj = await Project.findOne({_id:project_id}).populate('report_template_id').exec();
            if(!project_obj){
                result.message = 'project not found!'
                console.log(result.message);
                return result;
            }
        }

        if(!pro_pr_obj){
            pro_pr_obj = await Project_pr.find( 
                {$and:[
                    {project_id: project_id},
                    {'employee_prs.be_evaluated_id':emp_id}
                ]},
                {
                    project_id:1,department_id:1,ability_id:1,pr_topics:1,pr_avg:1,maxRank:1,minRank:1,distanceRank:1,assessment_num:1 ,
                    'employee_prs':{$elemMatch:{'be_evaluated_id':emp_id}}
                }
            )
            .populate('project_id')
            .populate('department_id')
            .populate('ability_id')
            .populate('pr_topics')
            .populate('employee_prs.be_evaluated_id')
            .exec();
                
            if(pro_pr_obj.length == 0) {
                result.message = 'project_pr not found!'
                console.log(result.message);
                return result;
            }
        }
    
        //2.取得員工資料
        employee_obj = await Employee.findOne({_id:emp_id});
        if(!employee_obj){
            result.message = 'employee not found!'
            console.log(result.message);
            return result;
        }
        
        //3.撈取專案回應檔
        pro_topic_res_Arr = await Pro_topic_res.find({
            $and:[{project_id:project_id},{be_evaluated_id:emp_id}]});
        if(pro_topic_res_Arr.length == 0){
            result.message = 'pro_topic_res not found!'
            console.log(result.message);
            return result;
        }

        //==============組data================
        //頁首資訊
        data.push([{"report_title":project_obj.name,employee_name:employee_obj.name}]);

        //專案的pr項目--start--
        for(let i=0; i<pro_pr_obj.length; i++){
            let prTopics = pro_pr_obj[i].pr_topics; //此pr 項目的題目集合

            //pr項目標題、pr平均值給予
            let pr_item = {}; //存放pr內資料組合起來的物件 => 放入data
            let topic_res = []; //每個人pr的題目回應集合
            let cnt=0;//排除分數題的題目數量
            let abilityStr;//pr受評能力說明
            let emp_pr;            //員工pr

            if(pro_pr_obj[i].ability_id.ability==undefined){
                abilityStr = '';
            }else{
                abilityStr = pro_pr_obj[i].ability_id.ability
            }

            pr_item['pr_title'] = TITLE_S_STR + abilityStr + TITLE_E_STR;

            //抓emp pr value
            emp_pr = pro_pr_obj[i].employee_prs[0];
            pr_item['pr_value_str'] = emp_pr.pr_avg + '/' + pro_pr_obj[i].pr_avg + '('+ emp_pr.pr_value +')';
            
            try{//沒有content 可能出現錯誤
                //給pro_pr項目的題目編號
                for(let j=0,n=1; j<prTopics.length; j++){
                    if(prTopics[j].type == 2) continue; //分數題，return
                    let topicStr = TOPIC_STR+(n++);    
                    pr_item[topicStr] = prTopics[j].content;
                    cnt++;   //不是分數題，題目數量+1
                }
            }catch(e){
                console.log(e.message);
            }

            pr_item['type'] = cnt; //題目數量
            //評量人對pr項目內的題目
            for(let n=0; n<pro_topic_res_Arr.length; n++){
                //pr項目的題目回應
                let emp_topic_res = {};//res[]屬性的{}
                let pr_score = 0; //res[]屬性的pr 分數

                //每個評量人的回應題目彙整為emp_topic_res
                for(let j=0,p=1; j<prTopics.length; j++){
                    for(let m=0; m<pro_topic_res_Arr[n].topic.length; m++){//每人回應的題目
                        let topic = pro_topic_res_Arr[n].topic[m];
                        try{
                            //回應的題目id與pr項目設定的id比對
                            if(JSON.stringify(topic.topic_id) == JSON.stringify(prTopics[j]._id)){
                                switch(prTopics[j].type){
                                    case 2://分數題
                                        pr_score = pr_score + topic.topic_score;
                                        break;
                                    case 1://問答題
                                    case 3://選擇題
                                        emp_topic_res[TOPIC_STR+(p++)+'_res'] = topic.topic_res;
                                        break;
                                }
                                break;
                            }
                        }catch(e){
                            console.log(e.message);
                        }
                    }
                }
                emp_topic_res['pr_score'] = pr_score;
                topic_res.push(emp_topic_res);
            }

            pr_item['res']= topic_res;   
            dataForPrArr.push(pr_item);
        }
        data.push(dataForPrArr);//pr Arr推到data
        //專案的pr項目--end--

        //同事建議--start--
        suggest_obj['suggest_title'] = '【同事們想給你的建議】';
        suggest_obj['suggest_des'] = "同事建議內容";
        
        for(let i=0; i<pro_topic_res_Arr.length; i++){
            suggest_res_arr.push({suggest_res:pro_topic_res_Arr[i].suggest});
        }
        suggest_obj['res'] = suggest_res_arr;
        dataForSuggestArr.push(suggest_obj);
        data.push(dataForSuggestArr);//同事建議 Arr推到data
        //同事建議--end--
        
        //組result 回傳obj
        result.success = true;
        result.exportFileName = project_obj.name + '_' + employee_obj.job_no + '_' +employee_obj.name;
        result.data = data;

        return result;
    }catch(e){
        console.log(e.message)
    }
    return result;
}

//路徑是否存在該檔案
function isFile(getFilePath){
    try{
        let stat = fs.statSync(getFilePath);

        if(stat&&stat.isFile()) {
            return true;
        } else {
            return false;
        }
    }catch(e){
        console.log(e);
        return false;
    }
}

//取得專案資料
async function getProjectDate(project_id){
    project_obj = await Project.findOne({_id:project_id}).populate('report_template_id').exec();
    if(project_obj){
        try{
            projectName = project_obj.name;
            TEMP_FILE_NAME = project_obj.report_template_id.report_template_code +'.'+ project_obj.report_template_id.file_extension;
            if(!TEMP_FILE_NAME || TEMP_FILE_NAME == undefined){
                return false;
            }
            TEMPLATE_EXCEL_PATH = config.TEMPLATE_PATH + '/' + TEMP_FILE_NAME;
        }catch(e){
            console.log(e.message);
            return false;
        }
        return true;
    }
    return false;
}

module.exports={
    exportEjsexcel,
    exportEjsexcelAll
}