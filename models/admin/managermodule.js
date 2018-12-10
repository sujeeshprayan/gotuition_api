  	var db = require('../../config/db');
	var mysql = require('mysql');
	var datetime = require('node-datetime');

var manageruserexports = {

	/*get Manage rAgent Teachers List*/
    getManagerAgentTeachersList: async function (agentUserId) {
        var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName,U.Email, U.Phone, U.phoneVerified, U.emailVerified, U.Address, U.lastLoggedIn, U.Status, U.updatedOn, TC.tuitionCenterName, AT.joinStatus, AT.managerStatus, IFNULL(MU.Fname,'') AS reviewedByMangerFname, IFNULL(MU.Lname,'') AS reviewedByMangerLname, AT.agentComment FROM agentteachers AS AT LEFT JOIN users AS U ON AT.teacherUserId=U.userId LEFT JOIN tuitioncenters AS TC ON TC.teacherUserId = AT.teacherUserId LEFT JOIN users AS MU ON MU.userId = AT.reviewedBy WHERE AT.agentUserID=? ORDER BY AT.createdOn DESC";
        var inputs = [agentUserId];
        var format = mysql.format(sql, inputs);
        console.log(format);
        return await db.query(format);
    },

    /*Get Agent Users*/
    dbGetAgentUsers: async function () { 
        var sql = "SELECT userId,uniqueUserId,Fname,IFNULL(Lname,'') AS Lname,nickName,Email,Password,userToken,Gender,Phone,userRole,phoneVerified,emailVerified,Longitude,Latitude,Address,lastLoggedIn,Status,updatedOn FROM ?? WHERE ??=? AND ??=?  ORDER BY ?? DESC";
        var inputs = ["users", "userRole", 3 , "Status", 1 , "createdOn"];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },


    /*Get Inappropriate Flags*/
    getManagerInappropriateFlagsList: async function () { 

        var sql = "select DISTINCT TF.teacherUserId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.Phone, U.Email,TC.tuitionCenterName, (select count(*) AS flaggedCount from teacherstudentparentcontacts AS FC WHERE FC.teacherUserId=TF.teacherUserId AND FC.flagInappropriateStatus=1 AND FC.Status='active') AS flaggedCount from teacherstudentparentcontacts AS TF LEFT JOIN users AS U ON TF.teacherUserId=U.userId LEFT JOIN tuitioncenters AS TC ON TC.teacherUserId=U.userId where TF.flagInappropriateStatus=1 AND TF.Status='active' GROUP BY U.userId;";
        return await db.query(sql);
    },


    /*get Teachers Inappropriate Flagged Students / Parents List*/
    getTeacherInappropriateFlagsUsersList: async function (teacherUserId) { 

        var sql = "select TF.ContactId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.Phone, U.Email, TF.flaggedReason from teacherstudentparentcontacts AS TF LEFT JOIN users AS U ON TF.contactUserId=U.userId where TF.teacherUserId=? AND TF.flagInappropriateStatus=1 AND TF.Status='active';";
        var inputs = [teacherUserId];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    
    },


    /*get HelpA KidStudy Details*/
    getHelpAKidStudyDetails : async function (){

        var sql = "select HKS.helpAKidId, HKS.requesterName, HKS.requesterPhone, HKS.requesterEmail, HKS.kidName, HKS.kidPhone, HKS.kidAddress, HKS.userRelation, HKS.helpReason, HKS.adminComments, HKS.acceptStatus"; 

        sql += ", IFNULL((SELECT UT.uniqueUserId FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherUniqueUserId";/*action Taken Teacher UserId*/

        sql += ", IFNULL((SELECT UT.Fname FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherFname";/*action Taken Teacher Fname*/

        sql += ", IFNULL((SELECT UT.Lname FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherLname";/*action Taken Teacher Lname*/

        sql += ", IFNULL((SELECT UT.Phone FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherPhone";/*action Taken Teacher Phone*/
       
        sql += ", IFNULL((SELECT UT.Email FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherEmail";/*action Taken Teacher Email*/

        sql += ", IFNULL((SELECT UT.uniqueUserId FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherUniqueUserId";/*action Taken Teacher UserId*/

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS teacherTakenAction";/*teacher Taken Action*/

        sql += " from helpAKidStudy AS HKS WHERE HKS.Status='active' ORDER BY createdOn DESC";

        return await db.query(sql);

    },

    /*get HelpA KidStudy Single Details*/
    getHelpAKidStudySingleDetails : async function (helpAKidId){

        var sql = "select HKS.helpAKidId, HKS.requesterName, HKS.requesterPhone, HKS.requesterEmail, HKS.kidName, HKS.kidPhone, HKS.kidAddress, HKS.userRelation, HKS.helpReason, HKS.adminComments, HKS.acceptStatus"; 

        sql += ", IFNULL((SELECT UT.uniqueUserId FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherUniqueUserId";/*action Taken Teacher UserId*/

        sql += ", IFNULL((SELECT UT.Fname FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherFname";/*action Taken Teacher Fname*/

        sql += ", IFNULL((SELECT UT.Lname FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherLname";/*action Taken Teacher Lname*/

        sql += ", IFNULL((SELECT UT.Phone FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherPhone";/*action Taken Teacher Phone*/
       
        sql += ", IFNULL((SELECT UT.Email FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherEmail";/*action Taken Teacher Email*/

        sql += ", IFNULL((SELECT UT.uniqueUserId FROM helpAKidStudyTeacherActions AS HT LEFT JOIN users AS UT ON HT.teacherUserId = UT.userId WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS actionTakenTeacherUniqueUserId";/*action Taken Teacher UserId*/

        sql += ", IFNULL((SELECT Action FROM helpAKidStudyTeacherActions WHERE helpAKidId=HKS.helpAKidId AND Action!=3), '') AS teacherTakenAction";/*teacher Taken Action*/

        sql += " from helpAKidStudy AS HKS WHERE HKS.helpAKidId="+helpAKidId+" AND HKS.Status='active'";

        return await db.query(sql);

    },

    /*get HelpAKid Study Courses Details*/
    getHelpAKidStudyCoursesDetails : async function (helpAKidId){

        var sql ="select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName  from helpAKidStudyCourses AS HKSC LEFT JOIN subjecttopics AS ST ON ST.subjectTopicId = HKSC.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE ST.subjectTopicStatus='active' AND HKSC.Status='active' AND HKSC.helpAKidId="+helpAKidId;
        return await db.query(sql);

    },

    /*get Help A Kid Subjects*/
    getHelpAKidSubjects : async function (helpAKidId){

        var sql =" select GROUP_CONCAT(subjectTopicId) AS helpSubjectTopicIds from helpakidstudycourses where helpAKidId="+helpAKidId; /*comma seperated single row results*/
        return await db.query(sql);

    },
    

    /*get Help A Kid Subjects Teachers*/
    getHelpAKidSubjectsTeachers : async function (helpAKidId){

        var sql ="select TC.teacherUserId, IFNULL(U.Fname, '') AS teacherFname , IFNULL(U.Lname, '') AS teacherLname, IFNULL(U.Phone, '') AS teacherPhone, IFNULL(U.webPushSubscription, '') AS teacherWebPushSubscription, IFNULL(U.Email, '') AS teacherEmail, TP.helpAKidInterest, TP.alertKidFreeTeachRequest, TP.snoozeAlertStatus, TP.snoozedDateTime, TP.snoozeEndDate, TP.alertType from teachercourses AS TC LEFT JOIN users AS U ON TC.teacherUserId=U.userId LEFT JOIN teacherprofile AS TP ON TP.userId=U.userId where TC.subjectTopicId IN (select HC.subjectTopicId from helpakidstudycourses AS HC where HC.helpAKidId="+helpAKidId+") GROUP BY TC.teacherUserId"; 
        return await db.query(sql);

    },

    /*get Teacher Public Recommendations List*/
    getTeacherPublicRecommendationsList : async function (helpAKidId){

        var sql ="select TR.recommendationId, TR.recommendByEmail, TR.recommendByName, TR.recommendByPhone, TR.recommendByMessage, U.Fname AS teacherFname, IFNULL(U.Lname,'') AS teacherLname, U.Phone AS teacherPhone, U.Email AS teacherEmail  from teacherpublicrecommendations AS TR LEFT JOIN users AS U ON TR.teacherUserId=U.userId where TR.recommendationStatus=2;"; 
        return await db.query(sql);

    },

    /*get Teacher Public Recommendations Details*/
    getTeacherPublicRecommendationDetails : async function (recommendationId){

        var sql ="select TR.recommendationId, TR.recommendByEmail, TR.recommendByName, TR.recommendByPhone, TR.recommendByMessage, U.Fname AS teacherFname, IFNULL(U.Lname,'') AS teacherLname, U.Phone AS teacherPhone, U.Email AS teacherEmail  from teacherpublicrecommendations AS TR LEFT JOIN users AS U ON TR.teacherUserId=U.userId where TR.recommendationId="+recommendationId; 
        return await db.query(sql);

    },


    /*get subject categories*/
    dbgetsubjectcategories : async function (reqdata){

        var sql = "SELECT ?? FROM ?? ORDER BY ?? DESC";
        var inputs = [["subjectCategoryId", "subjectCategoryName", "haveSubcategory", "haveGroup", "haveSubgroup", "haveClass", "haveTopic","subjectCategoryStatus"], "subjectcategories", "createdOn"];
        var format = mysql.format(sql, inputs);        
        return await db.query(format);

    },

    /*get subject subcategories*/
    dbgetsubjectsubcategories : async function (reqdata){

        var sql = "SELECT SSC.subjectSubcategoryId, SSC.subjectSubcategoryName, SSC.haveGroup, SSC.haveSubgroup, SSC.haveClass, SSC.haveTopic, SSC.subjectSubcategoryStatus, SSC.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName"; 
        sql += " FROM subjectsubcategories AS SSC LEFT JOIN subjectcategories AS SC ON SSC.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " ORDER BY SSC.createdOn DESC";
        return await db.query(sql);

    },

    /*get subject subcategories by main cat*/
    dbgetsubjectsubcategoriesbymaincat : async function (reqdata){

        var sql = "SELECT SSC.subjectSubcategoryId, SSC.subjectSubcategoryName, SSC.haveGroup, SSC.haveSubgroup, SSC.haveClass, SSC.haveTopic, SSC.subjectSubcategoryStatus, SSC.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName"; 
        sql += " FROM subjectsubcategories AS SSC LEFT JOIN subjectcategories AS SC ON SSC.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " WHERE SSC.subjectCategoryId="+reqdata.subjectcategoryId;
        sql += " ORDER BY SSC.createdOn DESC";
        return await db.query(sql);

    },

    /*get subject groups all*/
    dbgetsubjectallgroups : async function (){

        var sql = "SELECT SG.subjectGroupId, SG.subjectGroupName, SG.haveSubgroup, SG.haveClass, SG.haveTopic, SG.haveTopic, SG.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName"; 
        sql += " FROM subjectgroups AS SG LEFT JOIN subjectcategories AS SC ON SG.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SG.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " ORDER BY SG.createdOn DESC";
        return await db.query(sql);

    },

    /*subject groups  by Main Category OR Sub Category */
    dbgetSubjectGroupsbyMaincatSubcat : async function (reqdata){

        var sql = "SELECT SG.subjectGroupId, SG.subjectGroupName, SG.haveSubgroup, SG.haveClass, SG.haveTopic, SG.haveTopic, SG.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName"; 
        sql += " FROM subjectgroups AS SG LEFT JOIN subjectcategories AS SC ON SG.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SG.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
         sql += " WHERE SG."+reqdata.subjectGroupRequestField+"="+reqdata.subjectGroupRequestFieldId;
        sql += " ORDER BY SG.createdOn DESC";
        return await db.query(sql);

    },


     /*get subject subgroups all*/
    dbgetsubjectallsubgroups : async function (){

        var sql = "SELECT SSB.subjectSubgroupId, SSB.subjectSubgroupName, SSB.haveClass, SSB.haveTopic, SSB.subjectSubgroupStatus, SSB.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName"; 
        sql += " FROM subjectsubgroups AS SSB LEFT JOIN subjectcategories AS SC ON SSB.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SSB.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON SSB.subjectGroupId = SG.subjectGroupId"; 
         sql += " ORDER BY SSB.createdOn DESC";
        return await db.query(sql);


    },


    /*subject groups  by Main Category OR Sub Category OR Group */
    dbgetSubjectSubGroupsbyMaincatSubcatGroup : async function (reqdata){

        var sql = "SELECT SSB.subjectSubgroupId, SSB.subjectSubgroupName, SSB.haveClass, SSB.haveTopic, SSB.subjectSubgroupStatus, SSB.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName"; 
        sql += " FROM subjectsubgroups AS SSB LEFT JOIN subjectcategories AS SC ON SSB.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SSB.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON SSB.subjectGroupId = SG.subjectGroupId"; 
        sql += " WHERE SSB."+reqdata.subjectSubGroupRequestField+"="+reqdata.subjectSubGroupRequestFieldId;
        sql += " ORDER BY SSB.createdOn DESC";
        return await db.query(sql);

    },


     /*get subject classes all*/
    dbgetsubjectallclasses : async function (){

        
        var sql = "SELECT SCL.subjectClassId, SCL.subjectClassName, SCL.haveTopic, SCL.subjectClassStatus, SCL.createdOn, "; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName"; 
        sql += " FROM subjectclasses AS SCL LEFT JOIN subjectcategories AS SC ON SCL.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SCL.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON SCL.subjectGroupId = SG.subjectGroupId"; 
        sql += " LEFT JOIN subjectsubgroups AS SSG ON SCL.subjectSubgroupId = SSG.subjectSubgroupId"; 
         sql += " ORDER BY SCL.createdOn DESC";
        return await db.query(sql);

    },



    /*subject classes by Main Category OR Sub Category OR Group OR Subgroup*/
    dbgetSubjectClassbyMaincatSubcatGroupSubgroup : async function (reqdata){

        var sql = "SELECT SCL.subjectClassId, SCL.subjectClassName, SCL.haveTopic, SCL.subjectClassStatus, SCL.createdOn, "; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName"; 
        sql += " FROM subjectclasses AS SCL LEFT JOIN subjectcategories AS SC ON SCL.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON SCL.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON SCL.subjectGroupId = SG.subjectGroupId"; 
        sql += " LEFT JOIN subjectsubgroups AS SSG ON SCL.subjectSubgroupId = SSG.subjectSubgroupId"; 
         sql += " WHERE SCL."+reqdata.subjectClassRequestField+"="+reqdata.subjectClassRequestFieldId;
        sql += " ORDER BY SCL.createdOn DESC";
        return await db.query(sql);


    },

 

     /*get subject topics all*/
    dbgetsubjectalltopics : async function (){

        var sql = "SELECT ST.subjectTopicId, ST.subjectTopicName, ST.subjectTopicStatus, ST.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassName,'') AS subjectClassName"; 
        sql += " FROM subjecttopics AS ST LEFT JOIN subjectcategories AS SC ON ST.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON ST.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON ST.subjectGroupId = SG.subjectGroupId"; 
        sql += " LEFT JOIN subjectsubgroups AS SSG ON ST.subjectSubgroupId = SSG.subjectSubgroupId"; 
        sql += " LEFT JOIN subjectclasses AS SCL ON ST.subjectClassId = SCL.subjectClassId"; 
        sql += " ORDER BY ST.createdOn DESC";
        return await db.query(sql);

    },


     /*get subject topics by Main Category OR Sub Category OR Group OR Subgroup OR class*/
    dbgetSubjectTopicbyMaincatSubcatGroupSubgroupClass : async function (reqdata){

        var sql = "SELECT ST.subjectTopicId, ST.subjectTopicName, ST.subjectTopicStatus, ST.createdOn,"; 
        sql += " IFNULL(SC.subjectCategoryName,'') AS subjectCategoryName, IFNULL(SSC.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassName,'') AS subjectClassName"; 
        sql += " FROM subjecttopics AS ST LEFT JOIN subjectcategories AS SC ON ST.subjectCategoryId=SC.subjectCategoryId"; 
        sql += " LEFT JOIN subjectsubcategories AS SSC ON ST.subjectSubcategoryId=SSC.subjectSubcategoryId"; 
        sql += " LEFT JOIN subjectgroups AS SG ON ST.subjectGroupId = SG.subjectGroupId"; 
        sql += " LEFT JOIN subjectsubgroups AS SSG ON ST.subjectSubgroupId = SSG.subjectSubgroupId"; 
        sql += " LEFT JOIN subjectclasses AS SCL ON ST.subjectClassId = SCL.subjectClassId"; 
        sql += " WHERE ST."+reqdata.subjectTopicRequestField+"="+reqdata.subjectTopicRequestFieldId;
        sql += " ORDER BY ST.createdOn DESC";
        return await db.query(sql);

    },



    /*Get Comma Separated Topics*/
    dbGetCommaSeparatedTopics : async function (condition){

        var sql ="select GROUP_CONCAT(subjectTopicId) AS subjectTopicIds from subjecttopics where ?"; 
        var inputs = [condition];
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format);

    },

     
    
     /*Remove courses from different table*/
    dbRemoveTopicsMultipleRows : async function (table, subjectTopicIds){

        var sql ="DELETE FROM ?? WHERE subjectTopicId IN ("+subjectTopicIds+")"; 
        var inputs = [table, subjectTopicIds]; 
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format); 

    },


    /*get courses from different table*/
    dbGetTopicsMultipleRows : async function (table, subjectTopicIds){

        var sql ="SELECT count(*) AS countExists FROM ?? WHERE subjectTopicId IN ("+subjectTopicIds+")"; 
        var inputs = [table]; 
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format); 

    },

    /*get teacher courses from teachercourses*/
    dbGetTopicsTeacherMultipleRows : async function (table, subjectTopicIds){

        var sql ="SELECT COUNT(DISTINCT teacherUserId) AS includedTeachers FROM ?? WHERE subjectTopicId IN ("+subjectTopicIds+")"; 
        var inputs = [table]; 
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format); 

    },

    /*get teacher courses from studentcourses*/
    dbGetTopicsStudentMultipleRows : async function (table, subjectTopicIds){

        var sql ="SELECT COUNT(DISTINCT studentUserId) AS includedStudents FROM ?? WHERE subjectTopicId IN ("+subjectTopicIds+")"; 
        var inputs = [table]; 
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format); 

    },


    /*get teacher courses from helpakidstudycourses*/
    dbGetTopicsHelpAKidMultipleRows : async function (table, subjectTopicIds){

        var sql ="SELECT COUNT(DISTINCT helpAKidId) AS includedHelpAKid FROM ?? WHERE subjectTopicId IN ("+subjectTopicIds+")"; 
        var inputs = [table]; 
        var format = mysql.format(sql, inputs);
        console.log(format); 
        return await db.query(format); 

    },


    



    
 
    

}


module.exports = manageruserexports; 

