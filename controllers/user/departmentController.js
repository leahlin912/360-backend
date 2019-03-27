const errorHandler = require("../../utils/errorHandler");
const Department = require("../../models/department");
const checkNil = require("../../utils/nullChecker");
const Enterprise = require("../../models/enterprise");

const addDepartment = (req,res,next) => {
    if(checkNil(req.body, 2, [])){
        next(errorHandler.INVALID_PARAMETER);
        return;
    };

    Enterprise.findOne({_id: req.body.enterprise_id}, (err , enterprise) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!enterprise){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        let department = new Department({
            enterprise_id: enterprise,
            name: req.body.name
        });

        //department.department_code = department._id;
        
        department.save().then(() => {
            res.send(department);
        });
    });
};

const deleteDepartment = (req,res,next) => {
    let _id = req.params._id;
    
    Department.remove({_id: _id}, (err, result) => {
        if(err) {
            
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
};

const updateDepartment = (req,res,next) => {
    let _id = req.body._id;

    Department.update({_id : _id}, {$set:{
        name : req.body.name
    }}, (err, result) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
        }else if(result.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }else{
            res.send(result);
        }
    });
}

const getDepartment = (req,res,next) => {
    let _id = req.body._id;
    Department.findOne({_id : _id}, (err,result) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!result){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(result);
    });
}

const getDepartments = (req,res,next) => {
    Department.find({}, (err, result) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!result){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(result);
    });
}

module.exports = {
    addDepartment,
    deleteDepartment,
    updateDepartment,
    getDepartment,
    getDepartments
}