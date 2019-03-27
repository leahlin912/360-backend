//subject:login error管理
//create:190107
//author:陳冠穎

const ACCOUNT_IS_NOT_FOUND = {
    code:0,
    errorMsg:'Account is not found'
};

const PASSWORD_FAIL = {
    code:1,
    errorMsg:'Password fail'
};

module.exports = {
    ACCOUNT_IS_NOT_FOUND,
    PASSWORD_FAIL
}