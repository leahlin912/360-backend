//subject:登入系統-身分驗證
//create:190108
//author:陳冠穎

const jwt = require('jsonwebtoken');// 載入 jwt 函式庫協助處理建立/驗證 token
const config = require('../../config');
const checkNil = require('../../utils/nullChecker');
const Employee = require('../../models/employee');
const Parameter = require('../../models/parameter');
const Project = require('../../models/project');

module.exports = {
    loginFunc: function (req, res){
        
        if(checkNil(req.body, 2 ,[])){
            next(errorHandler.FAIL);
            return;
        }

        Employee.findOne(
            {account: req.body.account}, 
            async function (err, emp) {
                if (err) throw err;
            
                if (!emp) {
                    res.json({ success: false, message: 'Authenticate failed. User not found'});
                } 
                else if (emp) {
                    if (emp.password != req.body.password) {
                        res.json({ success: false, message: 'Authenticate failed. Wrong password'});
                    } 
                    else {
                        let empToToken;
                        let token;
                        let parameter;
                        let current_pro = {};
                        let empJSON = JSON.parse(JSON.stringify(emp));
                        delete empJSON.password;
                        
                        empToToken = {
                            user_id:empJSON._id,
                            enterprise_id:empJSON.enterprise_id,
                            department_id:empJSON.department_id,
                            account:empJSON.account,
                            name:empJSON.name
                        };

                        token = jwt.sign(empToToken, config.jwtTokenSecret, {
                            //expiresIn: 60*60*24  // 授權時效24小時
                            expiresIn: 60*60   // 授權時效1小時
                        });

                        //依參數設定的目前專案撈取專案資料
                        parameter = await Parameter.findOne({});
                        if(parameter && parameter.current_project_id != undefined)
                            current_pro = await Project.findOne({_id:parameter.current_project_id});

                        res.json({
                            success: true,
                            user:JSON.stringify(empJSON),
                            userToToken:JSON.stringify(empToToken),
                            token: token,
                            project:JSON.stringify(current_pro)
                        });
                    }
                }
            }    
        )
        .populate('enterprise_id')
        .populate('department_id')
        .populate({
            path: "purview",
            populate: { path: "system_code_id"}
        });
    }
};
