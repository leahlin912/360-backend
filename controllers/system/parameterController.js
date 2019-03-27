const errorHandler = require("../../utils/errorHandler");
const Parameter = require("../../models/parameter");
const checkNil = require("../../utils/nullChecker");

const addParameter = (req,res,next) => {
    if(checkNil(req.body, 2, ["current_project_id"])){
        next(errorHandler.FAIL);
        return;
    }

    let parameter = new Parameter({
        pr_same_score_decide: req.body.pr_same_score_decide,
        current_project_id: (req.body.current_project_id === "")?null:req.body.current_project_id
    });

    parameter.save().then(() => {
        res.send(parameter);     
    });
};

const updateParameter = (req,res,next) => {
    Parameter.findOneAndUpdate({_id: req.body._id}, {$set: {
        pr_same_score_decide:req.body.pr_same_score_decide,
        current_project_id: (req.body.current_project_id === "")?null:req.body.current_project_id
    }}, (err, parameter) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else{
            Parameter.findOne({_id: parameter._id}, (err,result) => {
                if(err){
                    next(errorHandler.FAIL);
                    return;
                }else{
                    res.send(result);
                }
            });
        }
    });
};

const setParametersStatus = (req,res,next) => {
    Parameter.findOneAndUpdate({_id: req.body._id}, {$set: {
    pr_same_score_decide:req.body.pr_same_score_decide}}, (err, parameter) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else{
            Parameter.findOne({_id: parameter._id}, (err,result) => {
                if(err){
                    next(errorHandler.FAIL);
                    return;
                }else{
                    res.send(result);
                }
            });
        }
    });  
};

const getParameters = (req,res,next) => {
    Parameter.find({}, (err,parameter) => {
        if(err){
            next(errorHandler.FAIL);
                    return;
        }else{
            res.send(parameter);
        }
    });
};

module.exports = {
    addParameter,
    updateParameter,
    getParameters,
    setParametersStatus
}