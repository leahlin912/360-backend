//subject:公告欄管理
//create:190107
//author:陳冠穎

const errorHandler = require('../../utils/errorHandler');
const successHandler = require('../../utils/successHandler');
const billBoardErrorHandler = require('../../utils/billboardErrorHandler');
const checkNil = require('../../utils/nullChecker');
const Billboard = require('../../models/billboard');

//新增公告
const addBillboard = (req, res, next) => {
    let title = req.body.title;//標題
    let content = req.body.content;//內容
    let date_start = req.body.date_start;
    let date_end = req.body.date_end;
    let successMsg;

    if(checkNil(req.body, 4 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    if(title === undefined
        || content === undefined
        || date_start === undefined
        || date_end === undefined){
        next(errorHandler.INVALID_PARAMETER);
        return;
    }

    if(title === null || title === ""){
        res.send(billBoardErrorHandler.TITLE_EMPTY);
        return;    
    }

    if(content ===null || content===""){
        res.send(billBoardErrorHandler.CONTENT_EMPTY);
        return;    
    }

    if(date_start ===null || date_start===""){
        res.send(billBoardErrorHandler.DATE_START_FAIL);
        return;    
    }

    if(date_end ===null || date_end===""){
        res.send(billBoardErrorHandler.DATE_END_FAIL);
        return;    
    }

    //抓公告最大序號並將公告寫入db
    Billboard.find({}).sort({'billboard_no':-1}).limit(1).exec( (err, bill) => {
        if(err){
            next(err);
            return;
        }

        let maxBillboardNo = 0 ;
        
        if(bill.length>0){
            maxBillboardNo = parseInt(bill[0].billboard_no);
        }

        try{
            new Billboard({
                billboard_no:maxBillboardNo +1,
                title:title,
                content:content,
                date_start:date_start,
                date_end:date_end,
                insert_date:new Date()
            }).save((err,billboard)=>{
                if(err){
                    next(errorHandler.INTERNAL_DB_ERROR);
                    return;
                }

                successMsg =JSON.parse(JSON.stringify(successHandler));
                successMsg['billboard'] = billboard;
                res.status(200).send(successMsg);
            });
        
        }catch(e){
            next(errorHandler.INTERNAL_DB_ERROR);
        }
        
        return;
    })
};

//修改公告
const updBillboard = (req, res, next) => {
    let billboard_id = req.body.billboard_id; //公佈欄ID
    let title = req.body.title;//標題
    let content = req.body.content;//內容
    let date_start = req.body.date_start;
    let date_end = req.body.date_end;
    let successMsg;
    let billboardObj;

    if(checkNil(req.body, 5 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    Billboard.updateOne(
        {_id:billboard_id}, 
        {$set:{title:title,content:content,date_start:date_start,date_end:date_end}}, 
        async(err, bill) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }

            billboardObj = await Billboard.findOne({_id:billboard_id});
            if(!billboardObj) billboardObj = {};
            successMsg =JSON.parse(JSON.stringify(successHandler));
            successMsg['billboard'] = billboardObj;
            res.status(200).send(successMsg);
        }
    )
};

//刪除公告
const delBillboard = (req, res, next) => {
    let billboard_id = req.body.billboard_id; //公佈欄ID

    if(checkNil(req.body, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    Billboard.deleteOne(
        {_id:billboard_id}, 
        (err, bill) => {
            if(err){
                next(errorHandler.INTERNAL_DB_ERROR);
                return;
            }
            res.status(200).send(successHandler);
        }
    )
};

//取得全部公告
const getBillboard = (req, res, next) => {
    Billboard.find({}, (err, billboard) => {
        if(err){
            next(err);
            return;
        }
        if(!billboard){// not found
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        res.send(billboard);
        return;
    });
};

//依tilte查詢公告
const searchBillboard  = (req, res, next) => {
    let title =  req.body.title;

    if(checkNil(req.body, 1 ,[])){
        next(errorHandler.FAIL);
        return;
    }

    // new RegExp 模糊查詢
    Billboard.find({title: new RegExp(title)}, (err, billboard) => {
        if(err){
            next(err);
            return;
        }
        if(!billboard){// not found
            next(errorHandler.DATA_NOT_FOUND);
            return;
        }

        res.send(billboard);
        return;
    });
};

module.exports = {
    addBillboard,
    updBillboard,
    delBillboard,
    getBillboard,
    searchBillboard
}