//subject:抓取現在時間
//create:190114
//example: 2017/08/09 20:34:02

module.exports = ()=>{
    var date = new Date();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    var hh = date.getHours();
    var mi = date.getMinutes();
    var ss = date.getSeconds();

    return [date.getFullYear(), "/" +
        (mm > 9 ? '' : '0') + mm, "/" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
};