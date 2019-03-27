const express = require('express');
const qs = require('qs');
const router = express.Router();
//const jwt = require('jsonwebtoken');// 載入 jwt 函式庫協助處理建立/驗證 token
//const expressJwt = require("express-jwt");// jwt.js,token中间件

const config = require('../../config');
const login = require('../../controllers/system/loginController');
const enterprise = require("./enterpriseRoute");
const department = require("./departmentRoute");
const employeeRoute = require("./employeeRoute");
const topicRoute = require("./topicRoute");
const projectRoute = require("./projectRoute");
const project_prRoute = require("./project_prRoute");
const report_templateRoute = require("./report_templateRoute");
const project_emp_statusRoute = require("./project_emp_statusRoute");
const pro_topic_resRoute = require("./pro_topic_resRoute");
const employee_prRoute = require("./employee_prRoute");
const pamameterRoute = require("./parameterRoute");
const system_codeRoute = require("./system_codeRoute");
const purviewRoute = require("./purviewRoute");
const abilityRoute = require("./abilityRoute");
//mytest-------
const tokenRoute = require("./tokenRoute");
//mytest-------
//dylan route--s--
const billboardRoute = require('./billboardRoute');
const evaluationListRoute = require('./evaluationListRoute');
const assessmentRoute = require('./assessmentRoute');
const assessmentResultOfDep = require('./assessmentResultOfDepRoute');
const exportRoute = require('./exportRoute');
//dylan route--e--

const unlessPath = {//不要token檢驗的路徑
  path: [
    {url:"/api"},
    {url:"/api/login", methods: ['POST']},//系統登入
    {url:"/api/nodeExcelExport"}
  ]
};

// router.use(expressJwt({secret:config.jwtTokenSecret}).unless(unlessPath));
// router.use(function (err, req, res, next) {
//   var token = req.body.token || req.query.token || req.headers['x-access-token'];
//   if (token) {
//     jwt.verify(token, config.jwtTokenSecret, function (err, decoded) {
//       if (err) {
//         if(err.name === "TokenExpiredError")
//           return res.status(401).json({success: false, status: res.status, message: 'Token has expired.'}); //token 過期
//         return res.json({success: false, message: 'Failed to authenticate token.'});
//       }else{
//         req.decoded = decoded;
//         next();
//       }
//     })
//   } else {
//     return res.status(403).send({
//       success: false,
//       message: 'No token provided.'
//     })
//   }
// });

router.get('/', (req,res,next) => {

  console.log(JSON.stringify({test:'test'}))
  //res.type('json')
  // res.json({test:'test'})
  res.send({test:'test'});
  return;
  
});
// router.post('/login', login.loginFunc);
// router.post('/authenticate', (req,res,next) => {
//   res.send("身分驗證測試用路徑");
//   return;
// });
// router.post('/test', (req,res,next) => {
//   res.send('test');
//   return;
// });

router.use("/enterprise", enterprise);
router.use("/department", department);
router.use("/employee", employeeRoute);
router.use("/topic", topicRoute);
router.use("/project", projectRoute);
router.use("/project_pr", project_prRoute);
router.use("/report_template", report_templateRoute);
router.use("/project_emp_status", project_emp_statusRoute);
router.use("/pro_topic_res", pro_topic_resRoute);
router.use("/employee_pr", employee_prRoute);
router.use("/parameter", pamameterRoute);
router.use("/system_code", system_codeRoute);
router.use("/purview", purviewRoute);
router.use("/ability", abilityRoute);
//mytest-------
router.use("/token", tokenRoute);
//mytest-------

//dylan route--s--
router.post('/login', login.loginFunc);
router.use('/billboard', billboardRoute);
router.use('/evaluationList', evaluationListRoute);
router.use('/assessment', assessmentRoute);
router.use('/assessmentResultOfDep', assessmentResultOfDep);
router.use('/export', exportRoute);
router.post('/sendMail', require("../../controllers/system/noticeMailController"));
//dylan route--e--

module.exports = router;