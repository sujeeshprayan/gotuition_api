"use strict";
var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');


var teachermodel = {

    /*get tuition center facilities*/
    gettuitioncenterfacilities: function (req, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=?";
        var inputs = [['facilityId', 'facilityName'], 'tuitioncenterfacilities', 'Status', 'active'];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                callback(0, "Failed to retrieve details !", "");
            } else {
                callback(200, "Success", data);
            }
        });
    },

    /* getTeacherProfileDetails */
    getTeacherProfileDetails: async function (teacherUserId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.ageGroup, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.createdOn, U.Status, IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.aadhaarNumber, '') AS aadhaarNumber, IFNULL(TP.customText, '') AS customText, TP.snoozeAlertStatus, TP.snoozedDateTime, TP.snoozeEndDate, TP.helpAKidInterest, TP.refferedBy, TP.otherCredentials, IFNULL(TP.adminRating, '') AS adminRating, TP.alertType, TP.alertInterval, TP.alertParentStudentRespond, TP.alertStudentJoinInterest, TP.alertKidFreeTeachRequest, TP.alertBusinessImproveNotification, TP.cardCustomTitle, TP.cardCustomSubtitle, TP.cardCustomSubject, TC.tuitionCenterId, IFNULL(TC.tuitionCenterName, '') AS tuitionCenterName, TC.newAdmissionStatus, TC.freeTuitionWillingness, TC.tuitionAt, TC.proffessionalTeachingExp, TC.homeTuitionExp, TC.nonTeachingExp,TC.totalStudentsTaught, IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights, IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating FROM users AS U LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TC ON U.userId=TC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId WHERE U.userId = "+teacherUserId;
        return await db.query(sql); 

    },

    /* get Teacher Tuition Center Facilities */
    getTeacherTuitionCenterFacilities: async function (teacherUserId){

        var sql = "select TCF.facilityId, TF.facilityName from tuitioncenterhavingfacilities AS TCF JOIN tuitioncenters AS TC ON TC.tuitionCenterId=TCF.tuitionCenterId LEFT JOIN tuitioncenterfacilities AS TF ON TF.facilityId=TCF.facilityId WHERE TC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

    /* get Teacher Courses */
    getTeacherCourses: async function (teacherUserId){

        var sql = "select ST.subjectTopicId, ST.subjectTopicName, ST.subjectTopicDisplayName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName from teacherCourses AS TC LEFT JOIN subjecttopics AS ST ON TC.subjectTopicId=ST.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE TC.teacherUserId="+teacherUserId+" AND ST.subjectTopicStatus='active'";
        return await db.query(sql);

    },

    /*get teacher rating*/
    getTeacherRating : async function (teacherUserId){

        var sql ="select ROUND(avg(Rating),1) AS userRating from userTeacherRating WHERE teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

    

    /*get Teacher Viewed Students*/
    getTeacherViewedStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.teacherAction=1) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

    /*get Teacher Contacted Students*/
    getTeacherContactedStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.teacherAction=2) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

     /*get Teacher Shortlisted Students*/
    getTeacherShortlistedStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.teacherAction=3) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

     /*get Teacher Admission Requested Students*/
    getTeacherAdmissionRequestedStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.contactUserAction=4) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

     /*get Teacher Admited Students*/
    getTeacherAdmitedStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.teacherAction=4) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);

    },

     /*get Teacher Old Students*/
    getTeacherOldStudents : async function (teacherUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.contactUserId = U.userId WHERE (TSPC.teacherAction=6) AND U.Status=1 AND TSPC.Status='active' AND TSPC.teacherUserId="+teacherUserId;
        return await db.query(sql);
 
    },

     /*get Teacher Course Students In Contact Viewed*/
    getTeacherCourseStudentsInContactViewed : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic,  U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.teacherAction=1 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },

      /*get Teacher Course Students In Contact Contacted*/
    getTeacherCourseStudentsInContactContacted : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId,U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic,  U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.teacherAction=2 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },


    /*get Teacher Course Students In Contact Shortlisted*/
    getTeacherCourseStudentsInContactshortlisted : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic,  U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.teacherAction=3 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },


    /*get Teacher Course Students In Admission Requested*/
    getTeacherCourseStudentsInContactadmissionRequested : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic,  U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.contactUserAction=4 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },


    /*get Teacher Course Students In Contact Admited*/
    getTeacherCourseStudentsInContactAdmited : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.teacherAction=4 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },

    /*get Teacher Course Students In Contact old*/
    getTeacherCourseStudentsInContactOld : async function (teacherUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from studentcourses AS SC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.contactUserId = SC.studentUserId LEFT JOIN users AS U ON U.userId = TSPC.contactUserId WHERE TSPC.teacherAction=6 AND TSPC.teacherUserId="+teacherUserId+" AND SC.subjectTopicId="+subjectTopicId+" AND SC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },


    /*get Teacher Course HelpAKIds Study*/
    getTeacherCourseHelpAKIdsStudy : async function (teacherUserId, subjectTopicId){

        var sql ="select HKS.helpAKidId, HKS.requesterName, HKS.requesterPhone, HKS.requesterEmail, HKS.kidName, HKS.kidPhone, HKS.kidAddress, HKS.userRelation, HKS.helpReason, HKS.adminComments"; 

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE teacherUserId!="+teacherUserId+" AND helpAKidId=HKS.helpAKidId AND Action!=3), '') AS otherTeacherAction";/*other teacher action*/

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE teacherUserId="+teacherUserId+" AND helpAKidId=HKS.helpAKidId), '') AS myAction";/*my action*/
     
        sql += " from helpAKidStudyCourses AS HKSC LEFT JOIN helpAKidStudy AS HKS ON  HKS.helpAKidId = HKSC.helpAKidId WHERE HKSC.subjectTopicId="+subjectTopicId+" AND HKSC.Status='active' AND HKS.acceptStatus='published' AND HKS.Status='active'";
      
        return await db.query(sql);

    },


    /*get HelpA KidStudy Details*/
    getHelpAKidStudyDetails : async function (helpAKidId, teacherUserId){

        var sql = "select HKS.helpAKidId, HKS.requesterName, HKS.requesterPhone, HKS.requesterEmail, HKS.kidName, HKS.kidPhone, HKS.kidAddress, HKS.userRelation, HKS.helpReason, HKS.adminComments"; 

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE teacherUserId!="+teacherUserId+" AND helpAKidId=HKS.helpAKidId AND Action!=3), '') AS otherTeacherAction";/*other teacher action*/

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE teacherUserId="+teacherUserId+" AND helpAKidId=HKS.helpAKidId), '') AS myAction";/*my action*/

        sql += " from helpAKidStudy AS HKS WHERE HKS.acceptStatus='published' AND HKS.Status='active' AND HKS.helpAKidId="+helpAKidId;

        return await db.query(sql);

    },


    /*get HelpAKid Study Courses Details*/
    getHelpAKidStudyCoursesDetails : async function (helpAKidId){

        var sql ="select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName  from helpAKidStudyCourses AS HKSC LEFT JOIN subjecttopics AS ST ON ST.subjectTopicId = HKSC.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE ST.subjectTopicStatus='active' AND HKSC.Status='active' AND HKSC.helpAKidId="+helpAKidId;
        return await db.query(sql);

    },


    /*dbGetTeacher Public ProfileId Details*/
    dbGetTeacherPublicProfileIdDetails: async function(profileId) {
            return await db.query("SELECT * FROM teacherprofile WHERE profileId=?", [profileId]);
    },



    /* get Public Teacher Profile Details */
    getPublicTeacherProfileDetails: async function (teacherUserId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName,  U.Gender,  U.userRole, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.createdOn, U.Status, IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.aadhaarNumber, '') AS aadhaarNumber, IFNULL(TP.customText, '') AS customText, TP.snoozeAlertStatus, TP.snoozedDateTime, TP.snoozeEndDate, TP.helpAKidInterest, TP.refferedBy, TP.otherCredentials, IFNULL(TP.adminRating, '') AS adminRating, TP.alertType, TP.alertInterval, TP.alertParentStudentRespond, TP.alertStudentJoinInterest, TP.alertKidFreeTeachRequest, TP.alertBusinessImproveNotification, TC.tuitionCenterId, IFNULL(TC.tuitionCenterName, '') AS tuitionCenterName, TC.newAdmissionStatus, TC.freeTuitionWillingness, TC.tuitionAt, TC.proffessionalTeachingExp, TC.homeTuitionExp, TC.nonTeachingExp,TC.totalStudentsTaught, IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights, IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating FROM users AS U LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TC ON U.userId=TC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId WHERE U.userId = "+teacherUserId;
        return await db.query(sql); 

    },


    /* db Get Check Help Akid Teacher Actions */  /*Actions ==> /* 1=Helping, 2=Will Look InTo It, 3=Ignore*/
    dbGetCheckMeHelpAkidTeacherActions: async function (teacherUserId, helpAKidId){

        var sql ="select * from helpAKidStudyTeacherActions where teacherUserId="+teacherUserId+" AND helpAKidId="+helpAKidId;
        return await db.query(sql); 

    },

     /* db Get Check Other HelpAkid Teacher Actions */  /*Actions ==> /* 1=Helping, 2=Will Look InTo It, 3=Ignore*/
    dbGetCheckOtherHelpAkidTeacherActions: async function (teacherUserId, helpAKidId){

        var sql ="select * from helpAKidStudyTeacherActions where teacherUserId!="+teacherUserId+" AND helpAKidId="+helpAKidId+" AND Action!=3";
        return await db.query(sql); 

    },


    /* get Teacher User Reviews */
    getTeacherUserReviews: async function (teacherUserId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.profilePic, U.userRole, TR.Rating, TR.Comments, TR.updatedOn from userteacherrating AS TR LEFT JOIN users AS U ON TR.userId=U.userId where TR.teacherUserId="+teacherUserId+" AND U.Status=1 ORDER BY TR.updatedOn DESC";
       console.log(sql);

        return await db.query(sql); 
    },


 


 



}

module.exports = teachermodel;