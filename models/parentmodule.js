"use strict";
var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');

var parentmodel = {

    /* get parent Profile Details */
    getParentProfileDetails: async function (parentUserId){

        var sql ="select U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.createdOn, U.Status, PP.snoozeAlertStatus, PP.snoozedDateTime, PP.snoozeEndDate, PP.alertType, PP.alertInterval, PP.prefferedTeachersJoinAlert, PP.messageReceivedAlert, PP.shortlistedMeAlert FROM users AS U LEFT JOIN parentprofile AS PP ON U.userId=PP.userId WHERE U.userId = "+parentUserId;
        return await db.query(sql);

    },


    /* get parent student Details */
    getParentStudents: async function (parentUserId){

        var sql ="select PS.parentStudentId, PS.studentFname, PS.studentLname FROM parentstudents AS PS WHERE PS.parentUserId = "+parentUserId;
        return await db.query(sql);

    },

 	/* get parent student Courses */
    getParentStudentCourses: async function (parentStudentId){

        var sql = "select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName from parentstudentcourses AS PSC LEFT JOIN subjecttopics AS ST ON PSC.subjectTopicId=ST.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE PSC.parentStudentId="+parentStudentId+" AND ST.subjectTopicStatus='active'";
        return await db.query(sql);

    },


    /* get Parent Students Distinct Subject TopicIds*/
    getParentStudentsDistinctSubjectTopicIds: async function (parentUserId){

        var sql = "select distinct PSC.subjectTopicId  from parentstudentcourses AS PSC LEFT JOIN parentstudents AS PS ON PSC.parentStudentId=PS.parentStudentId WHERE PS.parentUserId="+parentUserId;
        return await db.query(sql);

    },


}

module.exports = parentmodel;