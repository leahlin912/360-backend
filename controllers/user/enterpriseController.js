const errorHandler = require("../../utils/errorHandler");
const Enterprise = require("../../models/enterprise");
const checkNil = require("../../utils/nullChecker");

const addEnterprise = (req, res, next) => {
    let account = req.body.account;
    let password = req.body.password;
    let name = req.body.name;
    let full_name = req.body.full_name;
    let tax_no = req.body.tax_no;

    if(checkNil(req.body, 5, [])){
        next(errorHandler.FAIL);
        return;
    }

    // if(account === "" || password === "" || name === "" || full_name === "" || tax_no === ""){
    //     next(errorHandler.FAIL);
    //     return;
    // }

    let enterprise = new Enterprise({
        account: account,
        password: password,
        name: name,
        full_name: full_name,
        tax_no: tax_no
    });

    enterprise.save().then(() => {
        res.send(enterprise);
    });
};

const deleteEnterprise = (req,res,next) => {        //刪除用公司帳號密碼
    let account = req.body.account;
    let password = req.body.password;

    Enterprise.remove({account: account, password: password}, (err, result) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!result){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(result.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    });
}

const updateEnterprise = (req,res,next) => {        //更新用公司帳號
    let account = req.body.account;

    Enterprise.update({account: account},
        {$set:{
            password: req.body.password,
            name: req.body.name,
            full_name: req.body.full_name,
            tax_no: req.body.tax_no
        }}, (err, result) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(result.n === 0){
                next(errorHandler.DATA_NOT_FOUND);
                return;
            }else{
                res.send(result);
            }
        });
}

const getEnterprise = (req,res,next) => {       //取得用公司名稱
    let _id = req.body._id;

    Enterprise.findOne({_id: _id}, (err, enterprise) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!enterprise){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(enterprise);
    });
}

const getEnterprises = (req,res,next) => {
    
    Enterprise.find({}, (err, enterprise) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!enterprise){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(enterprise);
    });
}

module.exports = {
    addEnterprise,
    deleteEnterprise,
    updateEnterprise,
    getEnterprise,
    getEnterprises
}