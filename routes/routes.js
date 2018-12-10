var express =   require('express');
var router  =   express.Router();

var usermodule  =   require('../controllers/usermodule');
router.use('/usermodule',usermodule);

var subjectmodule = require('../controllers/subjectmodule');
router.use('/subjectmodule',subjectmodule);

var indexmodule = require('../controllers/index');
router.use('/',indexmodule);

var users = require('../controllers/users');
router.use('/users',users);

var teacher = require('../controllers/teachermodule');
router.use('/teacher',teacher);

var student = require('../controllers/studentmodule');
router.use('/student', student);

var parent = require('../controllers/parentmodule');
router.use('/parent', parent);

var common = require('../controllers/commonmodule');
router.use('/common', common);

var adminuser = require('../controllers/admin/usermodule');
router.use('/adminuser', adminuser);

var agentuser = require('../controllers/admin/agentmodule');
router.use('/agent', agentuser);

var manageruser = require('../controllers/admin/managermodule');
router.use('/manager', manageruser);

module.exports  = router;