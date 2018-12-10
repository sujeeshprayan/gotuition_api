"use strict";
var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');


var chatmodel = {

    /*get Teacher Chat Users*/
    getTeacherChatUsers : async function(userId){

       var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.profilePic, U.userRole, U.chatOnlineStatus, TSPC.ContactId, TSPC.teacherBlockChatStatus AS myChatBlockStatus, TSPC.userBlockChatStatus AS peerChatBlockStatus, IFNULL((SELECT UC.createdOn FROM userchats AS UC WHERE (UC.senderUserId = U.userId AND UC.receiverUserId = "+userId+") OR (UC.receiverUserId = U.userId AND UC.senderUserId = "+userId+") AND UC.Status='active' ORDER BY createdOn DESC LIMIT 0,1 ), '') AS lastChatTime  FROM `teacherstudentparentcontacts` AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE TSPC.teacherUserId="+userId+" AND (TSPC.teacherAction=2 OR TSPC.teacherAction=3 OR TSPC.teacherAction=4 OR TSPC.teacherAction=6 OR TSPC.contactUserAction=2 OR TSPC.contactUserAction=3 OR TSPC.contactUserAction=4) AND TSPC.Status='active' AND U.Status=1";
       return await db.query(sql);

    },


     /*get Parent Student Chat Users*/
    getParentStudentChatUsers : async function(userId){ 

       var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.profilePic, U.userRole, U.chatOnlineStatus, TSPC.ContactId, TSPC.userBlockChatStatus AS myChatBlockStatus, TSPC.teacherBlockChatStatus AS peerChatBlockStatus, IFNULL((SELECT UC.createdOn FROM userchats AS UC WHERE (UC.senderUserId = U.userId AND UC.receiverUserId = "+userId+") OR (UC.receiverUserId = U.userId AND UC.senderUserId = "+userId+") AND UC.Status='active' ORDER BY createdOn DESC LIMIT 0,1 ), '') AS lastChatTime  FROM `teacherstudentparentcontacts` AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE TSPC.contactUserId="+userId+" AND (TSPC.teacherAction=2 OR TSPC.teacherAction=3 OR TSPC.teacherAction=4 OR TSPC.teacherAction=6 OR TSPC.contactUserAction=2 OR TSPC.contactUserAction=3 OR TSPC.contactUserAction=4) AND TSPC.Status='active' AND U.Status=1";
       return await db.query(sql);

    },


     /* get parent student Details */
    getParentStudents: async function (parentUserId){

        var sql ="select PS.parentStudentId, PS.studentFname, PS.studentLname FROM parentstudents AS PS WHERE PS.parentUserId = "+parentUserId+" AND PS.Status='active'";
        return await db.query(sql);

    },


      /* get parent student Courses */
    getParentStudentCourses: async function (parentStudentId){

        var sql = "select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName from parentstudentcourses AS PSC LEFT JOIN subjecttopics AS ST ON PSC.subjectTopicId=ST.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE PSC.parentStudentId="+parentStudentId+" AND ST.subjectTopicStatus='active'";
        return await db.query(sql);

    },

    /*get my Chat Room Details*/
    getMyChatRoomDetails : async function(userId, chatRoomId){ 

       var sql = "SELECT C.userChatId, C.chatMessage, C.chatAttachment, C.chatType, C.chatStatus, C.createdOn, IF(C.senderUserId="+userId+",'true','false') AS myMessage, IFNULL(PS.studentFname,'') AS parentStudentFname, IFNULL(PS.studentLname,'') AS parentStudentLname FROM `userchats` AS C LEFT JOIN `parentstudents` AS PS ON C.parentStudentId=PS.parentStudentId WHERE C.roomId='"+chatRoomId+"' AND C.Status = 'active' ORDER BY `createdOn` ASC";
       return await db.query(sql);

    },





}



 module.exports = chatmodel;