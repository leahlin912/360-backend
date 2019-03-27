const errorHandler = require("../../utils/errorHandler");
const Ability = require("../../models/ability");
const checkNil = require("../../utils/nullChecker");

const addAbility = (req,res,next) => {
    if(checkNil(req.body, 1 , [])){
        next(errorHandler.FAIL);
        return;
    };

    let ability = new Ability({
        ability: req.body.ability
    });

    ability.save().then(() => {
        res.send(ability);
    })
}

const deleteAbility = (req,res,next) => {
    Ability.deleteOne({_id: req.params._id}, (err,ability) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else{
            res.send(errorHandler.SUCCESS);
            return;
        }
    })
}

const getAbilitys = (req,res,next) => {
    Ability.find({}, (err, abilitys) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else{
            res.send(abilitys);
        }
    });
};

module.exports = {
    addAbility,
    deleteAbility,
    getAbilitys
};