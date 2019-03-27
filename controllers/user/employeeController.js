const errorHandler = require("../../utils/errorHandler");
const Employee = require("../../models/employee");
const checkNil = require("../../utils/nullChecker");
const Enterprise = require("../../models/enterprise");
const Department = require("../../models/department");

const importAllEmployees = (req,res,next) => {
    var csv = req.file.buffer.toString("utf-8");

    var arrayN = csv.split("\r\n");
    console.log(arrayN);
    for(i = 1 ; i < arrayN.length ; i++){

        var arrayT = arrayN[i].split(",");

        let employee = new Employee({
            enterprise_id: req.body.enterprise_id,
            department_id: arrayT[0],
            account: arrayT[1],
            password: arrayT[2],
            job_no: arrayT[3],
            name: arrayT[4],
            position: arrayT[5],
            job_title: arrayT[6],
            supervisor_id: arrayT[7],
            situation: arrayT[8],
        });
        employee.save().then(() => {
            res.send(employee);
        });
    }     
    //console.log(req.body.test);
    //res.send(csv.split("\n")[0]);
}


const addEmployee = (req,res, next) => {                //create
    console.log(req.body);
    if(checkNil(req.body, 10, ["supervisor_id","due_date", "res_date", "phone_number", "address", "purview"])){
        next(errorHandler.INVALID_PARAMETER);
        return;
    };
    //輸入帳號找到對應的企業
    Enterprise.findOne({_id: req.body.enterprise_id}, (err,enterprise) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!enterprise){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        //輸入部門名稱找到對應的部門
        Department.findOne({_id: req.body.department_id}, (err,department) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else if(!department){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }

            Employee.findOne({job_no: req.body.supervisor_id}, (err, supervisor) => {
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else if(!supervisor){
                    supervisor = "";
                }
                let employee = new Employee({
                    enterprise_id: enterprise,
                    department_id: department,
                    account: req.body.account,
                    password: req.body.password,
                    job_no: req.body.job_no,
                    name: req.body.name,
                    position: req.body.position,
                    job_title: req.body.job_title,
                    supervisor_id: (supervisor === "")?null:supervisor._id,
                    situation: req.body.situation,
                    // due_date: req.body.due_date,//
                    // res_date: req.body.res_date,//
                    // phone_number: req.body.phone_number,//
                    // address: req.body.address,//
                    email: (req.body.email === "")?null:req.body.email,
                    purview: (req.body.purview === "")?null:req.body.purview     
                });
                employee.save().then(() => {
                    res.send(employee);
                });
            })
        });
    });
};

const deleteEmployee = (req,res,next) => {                     //delete是刪除整個資料  update是更新(刪除部分資料也是更新)

    Employee.remove({_id: req.params._id}, (err, result) => {     //這邊是設定條件  如果傳進來的參數有符合BD這筆資料裡面的值就可以刪除
        console.log(req.params);
        console.log(result);
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!result){
            //console.log(errorHandler);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(result.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    });
};

const updateEmployee = (req,res,next) => {                      //update 員工能修改自己的部分  未來可能考慮增加一個後台修改功能可以修改權限等等
    let data = req.body;

    Employee.findOne({job_no: data.supervisor_id}, (err,supervisor) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!supervisor){
            supervisor = "";
        }
        Employee.findOneAndUpdate({_id: data._id}, 
        
            //這邊設定是讓員工可以自己改自己的資料
            {$set:{password: data.password,
                department_id: data.department_id,
                job_no: data.job_no,
                name: data.name,
                position: data.position,
                job_title: data.job_title,
                supervisor_id: (supervisor === "")?null:supervisor._id,
                situation: data.situation,
                due_date: data.due_date,
                res_date: data.res_date,
                phone_number: data.phone_number,
                address: data.address,
                email: data.email
    
            //如果修改不給值會等於null
            }},(err, employee) => {              
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else if(employee.n === 0){
                    next(errorHandler.DATA_NOT_FOUND);
                    return;
                }else{
                    Employee.findOne({_id: employee._id}, (err,result) => {
                        if(err){
                            next(errorHandler.INTERNAL_DB_ERROR);
                            return;
                        }else{
                            res.send(result);
                        }
                    });
                };
        });
    });
};

const setPurview = (req,res,next) => {
    Employee.findOneAndUpdate({_id: req.body._id}, {$set:{
        purview: req.body.purview
    }}, (err, employee) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(employee.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }else{
            Employee.findOne({_id: employee._id}, (err,result) => {
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else{
                    res.send(result);
                }
            }).populate("purview");
        };
    });
};

const getEmployee = (req,res,next) => {                         //get一個
    
    Employee.findOne({_id: req.body._id}, (err, employee) => {
        if(err) {
            console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!employee){
            console.log(employee);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(employee);
    });
};

const getEmployees = (req,res,next) => {                        //get全部
    Employee.find({}, (err, employees) => {
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(employees);
    }).populate({
        path: "purview",
        populate: { path: "system_code_id"}
    });
};

module.exports = {
    importAllEmployees,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    setPurview,
    getEmployee,
    getEmployees
};