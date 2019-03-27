const errorHandler = require("../../utils/errorHandler");
const Topic = require("../../models/topic");
const checkNil = require("../../utils/nullChecker");
const Department = require("../../models/department");

const addTopic = (req,res,next) => {
    console.log(req.body);
    if(checkNil(req.body, 7, ["topic_code","option", "applicable_dep_id"])){
        next(errorHandler.FAIL);
        return;
    }

    topic = new Topic({
        topic_code: req.body.topic_code,
        applicable_dep_id: (req.body.applicable_dep_id === "")?null:req.body.applicable_dep_id,
        type: req.body.type,
        ability_id: req.body.ability_id,
        content: req.body.content,
        option: req.body.option.split(","),     //這邊做字串切割
        //valid: req.body.valid
    });
    
    topic.save().then(() => {
        res.send(topic);
    });
}

const deleteTopic = (req,res,next) => {

    Topic.remove({_id: req.params._id}, (err, result) => {
        if(err){
            console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!result){
            console.log(errorHandler.INTERNAL_DB_ERROR);

            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(result.n === 0){
            next(errorHandler.DATA_NOT_FOUND);
            return;
        };
        next(errorHandler.SUCCESS);
    });
}

const updateTopic = (req,res,next) => {

    Topic.findOneAndUpdate({_id: req.body._id},
        {$set:{
            applicable_dep_id: (req.body.applicable_dep_id === "")?null:req.body.applicable_dep_id,
            type: req.body.type, 
            ability_id: req.body.ability_id,
            content: req.body.content, 
            option: req.body.option.split(","),
            }},
            (err, topic) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }else{
                Topic.findOne({_id: topic._id}, (err, result) => {
                    if(err){
                        next(errorHandler.INTERNAL_DB_ERROR);
                        return;
                    }else{
                        res.send(result);
                    }
                });
            }
        });   
}

const getTopic = (req, res, next) => {

    Topic.findOne({_id: req.body._id}, (err, topic) => {
        if(err) {
            console.log(err);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }else if(!topic){
            console.log(errorHandler.INTERNAL_DB_ERROR);
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(topic);
    });
};

const getTopics = (req, res, next) => {
    Topic.find({}, (err, topics) => {
        if(err){
            next(errorHandler.INTERNAL_DB_ERROR);
            return;
        }
        res.send(topics);
    });
};

module.exports = {
    addTopic,
    deleteTopic,
    updateTopic,
    getTopic,
    getTopics
};

