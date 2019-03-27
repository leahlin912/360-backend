//subject:寄送email
//create:190107
//author:陳冠穎
//Remarks:需要安裝 npm install nodemailer
//_recipient(寄件者), _cc(副本), _bcc(密件副本), _subject(主旨), _html(內容), _attachments(附件), _callback
// attachments: [
//     {//文件text0.txt，以字符串，做為文件正文内容。
//         filename: 'text0.txt',
//         content: 'hello world!'
//     },
//     {//文件text1.txt，讀取本地文件，做為文件正文内容。
//         filename: 'text1.txt',
//         path: './attach/text1.txt'
//     }
// ]

module.exports = function(_recipient, _cc, _bcc, _subject, _html, _attachments, _callback){
    let nodemailer = require('nodemailer');// Mail模組
    let config = require("../config");
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        secureConnection: true, // 使用SSL方式（安全方式，防止被竊取信息）
        auth: {
            user: config.senderMail.user, //sendmail的Gmail Address
            pass: config.senderMail.password //sendmail的Gmail Password
        },
        tls: {
        // 不得檢查服務器所發送的憑證
        rejectUnauthorized: false
        }
    });

    //發送郵件
    transporter.sendMail(
        {
            from:config.senderMail.user, // sender address
            to:_recipient,      // 收件人
            cc:_cc,             //副本
            bcc:_bcc,           //密件副本
            subject:_subject,   // 主旨  
            html:_html,  // 信件內容
            attachments:_attachments //附件
        },
        function(err, info) {   //result
            _callback(err, info);
        }
    );
};