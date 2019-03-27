//subject:通知信件管理
//create:190125
//author:陳冠穎

const errorHandler = require('../../utils/errorHandler');
const successHandler = require('../../utils/successHandler');
const checkNil = require('../../utils/nullChecker');
const sendMail = require('../../utils/sendEmail');
const Project = require('../../models/project');
const Employee = require('../../models/employee');

const noticeContent = {
    SelectionOfAppraisers:{
        subject:"360系統通知：尚未完成挑選評量人",
        content:"「(專案名稱)」第一階段挑選評量人活動到(DATE)截止，請盡快進入360系統，完成第一階段挑選評量人活動"
    },
    MeasuringOthers:{
        subject:"360系統通知：尚未完成評比活動",
        content:"「(專案名稱)」第二階段評量他人活動到(DATE)截止，請盡快進入360系統，完成第二階段評量他人活動"
    }, 
    EndOfTheCompetition:{
        subject:"360系統通知：360評量報告結果",
        content:"本年度的360評比結果已經結束，請進入360系統查看報告"
    },
    SupervisorDismissed:{
        subject:"360系統通知：挑選評量人被駁回",
        content:"您挑選的評量人被主管駁回，請重新進入360系統，完成第一階段挑選評量人活動"
    },
    SupervisorAgree:{
        subject:"360系統通知：挑選評量人已獲同意",
        content:"您挑選的評量人已獲主管同意！"
    },
    EvaluationListSupervisorCheck:{
        subject:"360系統通知：下屬已送出自選評量者名單",
        content:"您的下屬(下屬名字)已送出自選的評量者名單，敬請撥冗至360系統平台進行審核，謝謝！"
    }
};

module.exports = async(req,res,next) =>{
    let optionStr = req.body.optionStr;
    let project_id = req.body.project_id;
    let emp_id_list = JSON.parse(req.body.emp_id_list);

    let projectObj;
    let levelEndDate;   //信件內文時間
    let contentStr;     //信件內文

    if(checkNil(req.body, 3 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    //optionStr 的選項沒有在noticeContent
    if(noticeContent[optionStr] == undefined){
        next(errorHandler.FAIL);
        return;
    }

    try{
        //找專案資料
        projectObj = await Project.findOne({_id:project_id});
        if(!projectObj){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        if(optionStr == 'SelectionOfAppraisers'){   //啟動挑選評量人截止日
            levelEndDate = projectObj.evaluation_date_end;
        }
        
        if(optionStr == 'MeasuringOthers'){ //員工互評到期日
            levelEndDate = projectObj.project_date_end;
        }
        contentStr = noticeContent[optionStr].content.replace("(專案名稱)", projectObj.name).replace("(DATE)", levelEndDate);

        for(let i=0; i<emp_id_list.length; i++){
            let recipient;
            let cc = '';
            let supervisor ;
            let empObj = await Employee.findOne({_id:emp_id_list[i]}).populate('supervisor_id');
            if(!empObj || empObj.email == undefined || empObj.email == null) continue;

            recipient = empObj.email;

            if(optionStr == 'EvaluationListSupervisorCheck'){ //使用者送審後，需寄信通知其審核主管
                contentStr = contentStr.replace("(下屬名字)", empObj.name);
                if(!empObj.supervisor_id || empObj.supervisor_id.email == undefined || empObj.supervisor_id.email == null){
                    continue;
                }  
                cc = recipient;
                recipient = empObj.supervisor_id.email;
            }

            sendMail(
                recipient, // 收件人
                cc,                         //副本
                '',                         //密件副本
                noticeContent[optionStr].subject,                  // 主旨  
                '<p>'+ contentStr +'</p>',   // 信件內容
                // [{                          //附件
                //     filename: '2018上半年評量_1070102_dylan2.xlsx',
                //     path: './export/2018上半年評量_1070102_dylan2.xlsx'
                // }]
                null,//附件
                (error, info) => {          //發mail後的處理
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(info.response);
                    }
                }
            );
        }

        res.send(successHandler);
    }catch(e){
        console.log(e.message);
        next(errorHandler.INTERNAL_SERVER_ERROR);
        return;
    }
}