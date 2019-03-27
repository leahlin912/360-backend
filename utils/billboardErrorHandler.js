//subject:公告欄error管理
//create:190107
//author:陳冠穎

const TITLE_EMPTY = {
    code:0,
    errorMsg:'Title is empty'
};

const CONTENT_EMPTY = {
    code:1,
    errorMsg:'Content is empty'
};

const DATE_START_FAIL = {
    code:2,
    errorMsg:'Date of start is fail'
};

const DATE_END_FAIL = {
    code:3,
    errorMsg:'Date of end is fail'
};

module.exports = {
    TITLE_EMPTY,
    CONTENT_EMPTY,
    DATE_START_FAIL,
    DATE_END_FAIL
}