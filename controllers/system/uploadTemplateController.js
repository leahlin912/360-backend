//subject:上傳template檔案
//create:190119
//author:陳冠穎
//npm install --save express-fileupload

const TEMPLATE_PATH = require('../../config').TEMPLATE_PATH;
const fs = require('fs');

const Project = require('../../models/project');
const ReportTemplate = require('../../models/report_template');

module.exports = async (req,res,next)=>{
    let project_id = req.body.project_id;
    let files  = req.files;

    let projectObj;
    if(project_id)
      projectObj =  await Project.findOne({_id:project_id}).exec();

    let result = new Promise((resolve, reject) => {
      files.map((v) => {
        fs.readFile(v.path, function(err, data) {
          let original_name ;
          let fileArr ;

          if(projectObj){
            fileArr = v.originalname.split('.');
            original_name = fileArr[0];
            v.originalname = projectObj.name + '.' + fileArr[1];
          }
          
          fs.writeFile(`${TEMPLATE_PATH}/${v.originalname}`, data,async function(err, data) {
            if (err)  reject(err);
            let fileArr = v.originalname.split('.');
            let reportTemplateId;

            if(!original_name)
              original_name = fileArr[0];
            
            try{
              reportTemplateId = await ReportTemplate.findOne({report_template_code:fileArr[0]}).exec();
              if(!reportTemplateId){
                  await new ReportTemplate({
                      report_template_code:fileArr[0],
                      file_extension:fileArr[1],
                      original_name:original_name
                  }).save();
                  reportTemplateId = await ReportTemplate.findOne({report_template_code:fileArr[0]}).exec();
              }else{
                await ReportTemplate.updateOne(
                  {report_template_code:fileArr[0]},
                  {$set:{
                    report_template_code:fileArr[0],
                    file_extension:fileArr[1],
                    original_name:original_name}
                  }
                );
              }

              if(projectObj && reportTemplateId){
                    await Project.updateOne({_id:project_id},{$set:{report_template_id:reportTemplateId._id}}).exec();
                    project_id = null;
                    projectObj = null;
              }
              
              resolve('成功');
            }catch(e){
              console.log(e.message);
            }
          })
        })
      })
    })

    result.then(r => {
      res.json({
        status:200,
        message: '上傳成功',
      })
    }).catch(err => {
      res.json({ err })
    });
}
