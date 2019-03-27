const errorHandler = require("../../utils/errorHandler");
const Purview = require("../../models/purview");
const checkNil = require("../../utils/nullChecker");

const addPurview = async (req,res,next) => {

    if(checkNil(req.body, 3, ["purview_code", "system_code_id"])){
        next(errorHandler.FAIL);
        return;
    }

    let purview = new Purview({
        purview_code: req.body.purview_code,
        description: req.body.description,
        system_code_id: (req.body.system_code_id === "")?[]:req.body.system_code_id.split(",")
    });

    // purview.save().then(() => {
    //     res.send(purview);
    // });
    await purview.save();

    console.log(purview._id);

    Purview.findOne({_id: purview._id}, (err, response) => {
        if(err){
            next(errorHandler.FAIL);
        }else{
            console.log(response);
            res.send(response);
        }
    }).populate("system_code_id");
};

const deletePurview = (req,res,next) => {
    Purview.deleteOne({_id: req.params._id}, (err, purview) => {
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!purview){
            //console.log(errorHandler);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(purview.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    });
}

const updatePurview = (req,res,next) => {
    Purview.findOneAndUpdate({_id: req.body._id}, {$set:{
        system_code_id: (req.body.system_code_id === "")?[]:req.body.system_code_id.split(",")
    }}, (err, purview) => {
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else{
            Purview.findOne({_id: purview._id}, (err, result) => {
                if(err) {
                    //console.log(err);
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }else{
                    res.send(result);
                }
            })
        }
    });
};

const getPurview = (req,res,next) =>{
    Purview.findOne({_id: req.body._id}, (err,purview) => {
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else{
            res.send(purview);
        }
    });
}

const getPurviews = (req,res,next) => {
    Purview.find({}, (err,purview) => {
        if(err) {
            //console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else{
            res.send(purview);
        }
    }).populate("system_code_id");
}

module.exports = {
    addPurview,
    deletePurview,
    updatePurview,
    getPurview,
    getPurviews
}