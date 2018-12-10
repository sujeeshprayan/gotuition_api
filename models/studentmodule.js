"use strict";
var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');

var studentmodel = {

  /* get Student Profile Details */
    getStudentProfileDetails: async function (studentUserId){

        var sql ="select  U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.createdOn, U.Status, SP.parentFname, SP.parentLname, SP.parentEmail, SP.parentPhone, SP.snoozeAlertStatus, SP.snoozedDateTime, SP.snoozeEndDate, SP.alertType, SP.alertInterval, SP.prefferedTeachersJoinAlert, SP.messageReceivedAlert, SP.shortlistedMeAlert FROM users AS U LEFT JOIN studentprofile AS SP ON U.userId=SP.userId WHERE U.userId = "+studentUserId;
        return await db.query(sql);

    },


   /* get Student Courses */
    getStudentCourses: async function (studentUserId){

        var sql = "select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName from studentcourses AS STC LEFT JOIN subjecttopics AS ST ON STC.subjectTopicId=ST.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE STC.studentUserId="+studentUserId+" AND ST.subjectTopicStatus='active'";
        return await db.query(sql);

    },


}

module.exports = studentmodel;