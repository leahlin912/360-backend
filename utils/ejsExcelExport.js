//subject:依樣板匯出ejsexcel
//create:190117
//author:陳冠穎
//Remarks:需要安裝 npm install ejsexcel

const ejsexcel = require("ejsexcel");
const fs = require("fs");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

//templateExcelPath=>樣板excelx路徑,exportPath=>匯出excel路徑,fileName=>匯出excel名稱,data=>匯入excel資料
module.exports = async (templateExcelPath,exportPath,fileName,data) => {
    //取得Excel模板的buffer
    const exlBuf = await readFileAsync(templateExcelPath);
    //用data渲染Excel模板
    const exlBuf2 = await ejsexcel.renderExcel(exlBuf, data);
    await writeFileAsync(exportPath + "/" + fileName, exlBuf2);
    console.log("匯出"+fileName);
}
