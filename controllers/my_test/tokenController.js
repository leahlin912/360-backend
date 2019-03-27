const errorHandler = require("../../utils/errorHandler");
const jwt = require("jsonwebtoken");
const config = require("../../config");

const User = require("../../models/employee");

const getToken = async (req,res,next) => {
    User.findOne({account: req.body.account}, (err, user) => {
        if(err){
            next(errorHandler.FAIL);
            return;
        }else if(!user){
            next(errorHandler.FAIL);
            return;
        }else{
            console.log(user);
            var token = jwt.sign({account: user.account}, config.jwtTokenSecret, {
                expiresIn: 60*60
            });
            res.send(token);
        }
    });
}

const checkToken = (req,res,next) => {
    var token = req.headers["x-access-token"];
    if(token){      //如果有token傳進來的情況
        jwt.verify(token, config.jwtTokenSecret, (err, decoded) => {
            if(err){
                next(errorHandler.FAIL);
                return;
            }else{
                req.decoded = decoded;
                next();
            }

        });
    }else{      //沒有tokrn傳進來的情況
        res.send(errorHandler.FAIL);
        return;
    }
}

module.exports = {
    getToken,
    checkToken
};
