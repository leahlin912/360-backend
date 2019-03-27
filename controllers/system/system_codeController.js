const errorHandler = require("../../utils/errorHandler");
const System_code = require("../../models/system_code");
const checkNil = require("../../utils/nullChecker");

const addSystem_code = (req,res,next) => {
    if(checkNil(req.body, 2, [])){
        next(errorHandler.FAIL);
        return;
    }

    let system_code = new System_code({
        system_code: req.body.system_code,
        description: req.body.description
    })

    system_code.save().then(() => {
        res.send(system_code);
    });
};

const getSystem_code = (req,res,next) => {
    System_code.findOne({_id: req.body._id}, (err,system_code) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else if(!system_code){
            next(errorHandler.FAIL);
            return;
        }else{
            res.send(system_code);
        }
    })
};

const getSystem_codes = (req,res,next) => {
    System_code.find({}, (err, system_code) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else{
            res.send(system_code);
        }
    });
}

module.exports = {
    addSystem_code,
    getSystem_code,
    getSystem_codes
};
