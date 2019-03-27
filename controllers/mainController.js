const getCurrentTime = require('../utils/getCurrentTime');
const fs = require('fs');

const test = (req,res,next) => {
    console.log(getCurrentTime())
    res.send("測試用路徑");
    return;
}

const home = (req, res, next) => {
    res.send("首頁");
    return;
}

//測試用發送email
const sendTestEmail = (req,res,next) => {
    const sendEmail = require('../utils/sendEmail');

    sendEmail(
        'lhuim2038@gmail.com;lhuim2039@gmail.com', // 收件人
        '',                         //副本
        '',                         //密件副本
        '系統測試',                  // 主旨  
        '<p>Hello,the world</p>',   // 信件內容
        // [{                          //附件
        //     filename: '2018上半年評量_1070102_dylan2.xlsx',
        //     path: './export/2018上半年評量_1070102_dylan2.xlsx'
        // }]
        null,
        (error, info) => {          //發mail後的處理
            if (error) {
            console.log(error);
            } else {
            console.log(info.response);
        }
    });

    res.send("測試發送Email");
    return;
}

module.exports = {
    test,
    home,
    sendTestEmail
};