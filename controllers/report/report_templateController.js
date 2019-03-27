const errorHandler = require("../../utils/errorHandler");
const Report_template = require("../../models/report_template");
const checkNil = require("../../utils/nullChecker");

const addReport_template = (req,res,next) => {
    if(checkNil(req.body, 5, [])){
        next(errorHandler.FAIL);
        return;
    }

    let report_template = new Report_template({

        title: req.body.title,
        paragraph: req.body.paragraph,
        content: req.body.content,
        home_pic: req.body.home_pic,
        valid: req.body.valid

    });

    report_template.report_template_id = report_template._id;

    report_template.save().then(() => {
        res.send(report_template);
    });
};

const deleteReport_template = (req,res,next) => {
    Report_template.remove({report_template_id: req.body.report_template_id}, (err,report_template) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!report_template){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(report_template.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        next(errorHandler.SUCCESS);
    }); 
}

const updateReport_template = (req,res,next) => {
    Report_template.update({report_template_id: req.body.report_template_id}, {$set: {
        title: req.body.title,
        paragraph: req.body.paragraph,
        content: req.body.content,
        home_pic: req.body.home_pic,
        valid: req.body.valid
    }}, (err, report_template) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!report_template){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(report_template.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }
        res.send(report_template);
    });
}

const getReport_template = (req,res,next) => {
    Report_template.findOne({report_template_id: req.body.report_template_id}, (err,report_template) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!report_template){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(report_template);
    });
}

const getReport_templates = (req,res,next) => {
    Report_template.find({}, (err,report_templates) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!report_templates){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(report_templates);
    });
}

module.exports = {
    addReport_template,
    deleteReport_template,
    updateReport_template,
    getReport_template,
    getReport_templates
}