/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../../config/db");
var sharemodel = require("../../models/shared/shared");
var commonmodel = require("../../models/commonmodule");
var usermodel = require('../../models/usermodule');
var managermodel = require('../../models/admin/managermodule');
var datetime = require("node-datetime");
var randomize = require("randomatic");
var adminusermodel = require('../../models/admin/usermodule');
var emailvalidator = require('email-validator'); 
var shared = require('../shared/shared');
 
////////////////////////////////////web-push///////////////////////////////////////////////////////////////////////////



router.post('/sendNotification', (req, res) => {


        sharemodel.dbgetdetails(["webPushSubscription"], "users", {"uniqueUserId":req.body.uniqueUserId}) /*get Web Push Subscription value*/
        .then(function (webpushData) {

            if(webpushData.length > 0){

                console.log("from-db-----> "+webpushData[0].webPushSubscription); 

                var subscription =  JSON.parse(webpushData[0].webPushSubscription);

                console.log(subscription);
 
                //var subscription =  {"endpoint":"https://fcm.googleapis.com/fcm/send/dOr-Z3XbRuI:APA91bEX3S7yRyPHXpOZmNetgC2xeLnKxrG2NtUJ0TndXn8aw15UWSBelg8r67msONTzedNmIZB3nrGbXgPmk_01jR_F69bPzpmC1GKEuhn5l1Buhm9YuyRFuzZgQhxWyaTWClFL_4Ja","expirationTime":null,"keys":{"p256dh":"BHc1F-jHSfaZXCxa2Y6K-Fk_oNdDlORTM6qHXDzebSTq6AD2atgrkT50dlj7Wj_any-QhS7CduCEs0eqeuyOyWY=","auth":"-yrJfSuYUD4J8hvL8RBjFw=="}};

                var title = "New Teacher Joined";

                var content = "New Teacher Joined On Your Subject";
                
                shared.sendNotifications(title, content, subscription);

            } else {

                console.log('Web Push Subscription Not Found !');
            }
        })
        .catch(function(err){

            console.log(err);

        });

});

////////////////////////////////////web-push///////////////////////////////////////////////////////////////////////////


/*agents users list */
router.post('/manager-agent-list', function(req, res){

    const callback = function(status, message, details){

        res.json({"status": status, "message": message, "details":details});

    }

    if(req.body.managerUniqueUserId=="") {

          callback(0, "User Id Should Not Be Empty !","");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');


                    if (userRole === 2) { /*if manager*/

                         managermodel.dbGetAgentUsers()

                        .then(function (userslist) {

                            callback(200, "Success", userslist);

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Get Details !", "");

                        });


                    }  else {

                        callback(0, "Invalid Manager Role Entry !", "");

                    }

                   
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Get Details !", "");

            });
    }

});



/*get-manager-agent-entries*/
router.post('/manager-agent-entries', function(req, res, details){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details" : details});
    }

 
    if(req.body.managerUniqueUserId==""){

         callback(0,"Manager User Id Should Not Be Empty !", "");

    } else if(req.body.agentUniqueUserId==""){

         callback(0,"Agent User Id Should Not Be Empty !", "");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId) /*get userid from uniqueuserid*/
        .then(function (managerData) {

            if (managerData.length > 0) {

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var managerUserId = managerData[0].userId;

                var managerUserRole = managerData[0].userRole;

 
                if (managerUserRole === 2) { /*if manager*/

                     sharemodel.dbGetUserIdfromUuid(req.body.agentUniqueUserId) /*get userid from uniqueuserid*/
                    .then(function (agentData) {

                        if (agentData.length > 0) {

                                var dt = datetime.create();

                                var dateymd = dt.format('Y-m-d H:M:S');

                                var agentUserId = agentData[0].userId;

                                var agentUserRole = agentData[0].userRole;

                            if (agentUserRole === 3) { /*if agent*/

                                managermodel.getManagerAgentTeachersList(agentUserId) /*get Manager Agent Teachers List*/
                                 .then(function (agentTeachers) {

                                     callback(200, "Success", agentTeachers);

                                })
                                .catch(function (error) {

                                    console.log(error);
                                    callback(0, "Request Failed !", "");

                                });

                            } else {

                                callback(0, "Invalid Agent Role !", "");

                            }
                    

                        } else {

                            callback(0, "Invalid Agent User !", "");

                        }
                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Request Failed !", "");

                    });


                } else {

                    callback(0, "Invalid User Manager Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid Manager User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Request Failed !", "");

        });
  
    }

}); 




/*agent's teacher status update*/
router.post('/manager-agent-teacher-status-update', function (req, res) {
    
    
    const callback = function (status, message) {

        res.json({"status": status, "message": message});

    };


    if(req.body.managerUniqueUserId == ""){

        callback(0, "Manager User Id Should Not Be Empty !");

     } else if(req.body.teacherUniqueUserId == ""){

        callback(0, "Teacher User Id Should Not Be Empty !");

    } else if(req.body.statusFlag == ""){

        callback(0, "Status Should Not Be Empty !");

    }  else if(req.body.statusFlag != 1 && req.body.statusFlag != 0 ){

        callback(0, "Invalid Status. Status Should Be 1 OR 0  !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId) /*get userid from uniqueuserid*/
        .then(function (managerData) {

            if (managerData.length > 0) {

                 var managerUserRole = managerData[0].userRole;

                 var managerUserId = managerData[0].userId;

                 if (managerUserRole === 2) { /*if manager*/

                    sharemodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*get userid from uniqueuserid*/
                    .then(function (data) {

                        if (data.length > 0) {

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var teacherUserId = data[0].userId;

                            var agentTable = "agentteachers";

                            var agentUpdateData = {
                                "managerStatus": req.body.statusFlag,
                                "reviewedBy" : managerUserId,
                                "updatedOn": dateymd
                            };

                            var agentCondition = { "teacherUserId": teacherUserId };

                            sharemodel.dbupdate(agentTable, agentUpdateData, agentCondition)/* agent table status update */
                            .then(function () {

                                var table = "users";

                                var updatedata = {
                                    "Status": req.body.statusFlag,
                                    "updatedOn": dateymd
                                };

                                var condition = { "userId": teacherUserId };

                                sharemodel.dbupdate(table, updatedata, condition)/* user table status update */
                                .then(function () {

                                    callback(200, "Teacher Status Updated Successfully");

                                })
                                .catch(function (error) {

                                    console.log(error);
                                    callback(0, "Failed to Update Teacher Status !");

                                });


                            })
                            .catch(function (error) {

                                console.log(error);
                                callback(0, "Failed to Update Teacher Status !");

                            });


                        } else {

                            callback(0, "Invalid Teacher !");

                        }
                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Failed to Update User Status !");

                    });



                 } else {

                    callback(0, "Invalid Manager Role Entry !");/*response with 401 header status*/

                 }



            } else {

                callback(0, "Invalid Manager User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed to Update User Status !");

        });

    }

});




/*Manager Inappropriate Flags*/
router.post('/manager-inappropriate-flags', function(req, res, details){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details" : details});
    }

 
    if(req.body.managerUniqueUserId==""){

         callback(0, "Manager User Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId) /*get userid from uniqueuserid*/
        .then(function (managerData) {

            if (managerData.length > 0) {

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var managerUserId = managerData[0].userId;

                var managerUserRole = managerData[0].userRole;

                if (managerUserRole === 2) { /*if manager*/
 
                    managermodel.getManagerInappropriateFlagsList() /*get Inappropriate Flags*/
                    .then(function (inappropriateFlags) {

                         callback(200, "Success", inappropriateFlags);

                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Request Failed !", "");

                    });

                } else {

                    callback(0, "Invalid User Manager Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid Manager User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Request Failed !", "");

        });
  
    }

}); 



/*Manager Inappropriate Flags User Details*/
router.post('/manager-inappropriate-flag-user-details', function(req, res, details){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details" : details});
    }

 
    if(req.body.managerUniqueUserId==""){

         callback(0, "Manager User Id Should Not Be Empty !", "");

    } else if(req.body.teacherUniqueUserId==""){

         callback(0, "Teacher User Id Should Not Be Empty !", "");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId) /*get userid from uniqueuserid*/
        .then(function (managerData) {

            if (managerData.length > 0) {

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var managerUserId = managerData[0].userId;

                var managerUserRole = managerData[0].userRole;

                if (managerUserRole === 2) { /*if manager*/


                    sharemodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*get userid from uniqueuserid*/
                    .then(function (teacherData) {

                        if (teacherData.length > 0) {

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var teacherUserId = teacherData[0].userId;

                            var teacherUserRole = teacherData[0].userRole;
 
                             managermodel.getTeacherInappropriateFlagsUsersList(teacherUserId) /*get Teachers Inappropriate Flagged Students / Parents List*/
                            .then(function (inappropriateFlagsUsers) {

                                 callback(200, "Success", inappropriateFlagsUsers);

                            })
                            .catch(function (error) {

                                console.log(error);
                                callback(0, "Request Failed !", "");

                            });


                        } else {

                            callback(0, "Invalid Teacher User !", "");

                        }
                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Request Failed !", "");

                    });

 

                } else {

                    callback(0, "Invalid User Manager Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid Manager User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Request Failed !", "");

        });
  
    }

}); 




/*Manager : Help A Kid Study Details*/
router.post('/manager-helpakidstudy-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});

    }


 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.getHelpAKidStudyDetails() /*get HelpAKidStudy Details*/
                    .then(function(kidStudyData){

                        console.log(kidStudyData);
                        console.log(kidStudyData.length);

                        if(kidStudyData.length > 0){

                            var c = 1;

                            kidStudyData.forEach(function (item, index, array) { /*loop*/

                                var helpAKidId =  item.helpAKidId;

                                managermodel.getHelpAKidStudyCoursesDetails(helpAKidId) /*Fetch HelpAKidStudy Courses Details*/
                                .then(function (KidStudyCoursesDetails) {

                                    item.KidStudyCoursesDetails = KidStudyCoursesDetails; /*CourseHelpKidStudy to CourseHelpKidStudy index*/

                                    /*check for last loop to send final response*/
                                    if (c == kidStudyData.length) { 

                                         console.log(c);

                                        /*response*/
                                       callback(200, "Success", kidStudyData);/*response*/

                                    }


                                    c++; /*counter increment*/

                                })
                                .catch(function(err){

                                    console.log(err);

                                });

                            });

                        } else {

                            callback(0, "No details Found !","");

                        }
                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed To Get Details !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});



/*Manager : Help A Kid Study Single Details*/
router.post('/manager-helpakidstudy-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});

    }


 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    } else if(req.body.helpAKidId == "") {

        callback(0, "Help A Kid Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.getHelpAKidStudySingleDetails(req.body.helpAKidId) /*get HelpAKidStudy Details*/
                    .then(function(kidStudyData){

                        console.log(kidStudyData);

                        if(kidStudyData.length > 0){

                            var c = 1;

                            kidStudyData.forEach(function (item, index, array) { /*loop*/

                                var helpAKidId =  item.helpAKidId;

                                managermodel.getHelpAKidStudyCoursesDetails(helpAKidId) /*Fetch HelpAKidStudy Courses Details*/
                                .then(function (KidStudyCoursesDetails) {

                                    item.KidStudyCoursesDetails = KidStudyCoursesDetails; /*CourseHelpKidStudy to CourseHelpKidStudy index*/

                                    /*check for last loop to send final response*/
                                    if (c == kidStudyData.length) { 

                                        console.log(c);
                                        /*response*/
                                       callback(200, "Success", kidStudyData[0]);/*response*/

                                    }


                                    c++; /*counter increment*/

                                })
                                .catch(function(err){

                                    console.log(err);

                                });

                            });

                        } else {

                            callback(0, "No details Found !","");

                        }
                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed To Get Details !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});





/*Manager : Help A Kid Study Add Comments & Status Updation (publish / unpublish)*/
router.post('/manager-helpakid-student-comments-status-update', function (req, res) {
    
    
    const callback = function (status, message) {

        res.json({"status": status, "message": message});

    };


    if(req.body.managerUniqueUserId == ""){

        callback(0, "Manager User Id Should Not Be Empty !");

     } else if(req.body.helpAKidId == ""){

        callback(0, "Help A Kid Id Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId) /*get userid from uniqueuserid*/
        .then(function (managerData) {

            if (managerData.length > 0) {

                 var managerUserRole = managerData[0].userRole;

                 var managerUserId = managerData[0].userId;

                 if (managerUserRole === 2) { /*if manager*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var helpTable = "helpakidstudy";

                    var helpCondition = { "helpAKidId": req.body.helpAKidId };

                    if(req.body.acceptStatus!="" && req.body.adminComments!=""){

                        var helpUpdateData = {
                            "acceptStatus": req.body.acceptStatus,
                            "adminComments" : req.body.adminComments,
                            "updatedOn": dateymd
                        };

                    } else if(req.body.acceptStatus!=""){

                        var helpUpdateData = {
                            "acceptStatus": req.body.acceptStatus,
                            "updatedOn": dateymd
                        };

                    } else if(req.body.adminComments!=""){

                        var helpUpdateData = {
                            "adminComments": req.body.adminComments,
                            "updatedOn": dateymd
                        };

                    }
                    

                    sharemodel.dbupdate(helpTable, helpUpdateData, helpCondition)/* help table status update */
                    .then(function () {

                        managermodel.getHelpAKidSubjectsTeachers(req.body.helpAKidId)/* get Help A Kid Subjects */
                        .then(function (helpSubjectsTeachers) {

                            console.log(helpSubjectsTeachers);

                            if(req.body.acceptStatus=="published") {/*if status is published then send email & sms*/

                                /*get admin email*/
                                sharemodel.getadminemail()
                                .then(function (adminemailres) {

                                    var adminemail = adminemailres[0].Email;
                                    var emailfrom = adminemail;
                                    var subject = 'GoTuition : New Help A Kid Study Request';
                                    var baseurl = shared.getbaseurl();/*base url*/
     
                                    helpSubjectsTeachers.forEach(function(item, index, array){ /* get each email from array to send email */

                                        var teacherUserId = item.teacherUserId;
                                        var teacherPhone = item.teacherPhone;
                                        var teacherEmail = item.teacherEmail;
                                        var teacherFname = item.teacherFname;
                                        var teacherLname = item.teacherLname;
                                        var teacherWebPushSubscription = item.teacherWebPushSubscription;
                                        var alertKidFreeTeachRequest = item.alertKidFreeTeachRequest;
                                        var snoozeAlertStatus = item.snoozeAlertStatus;
                                        var snoozedDateTime = item.snoozedDateTime;
                                        var snoozeEndDate = item.snoozeEndDate;                                     
                                        var alertType = item.alertType;

                                        /*if snooze On or Off & snooze dates are over*/
                                        if( (snoozeAlertStatus=="Yes" || snoozeAlertStatus=="No" ) && ((dateymd >= snoozedDateTime && dateymd >= snoozeEndDate) ||  (dateymd <= snoozedDateTime && dateymd <= snoozeEndDate))) { 

                                            if(teacherEmail != "" && alertKidFreeTeachRequest=="On" && (alertType=='Email' || alertType=='Both')){

                                                console.log('email');
                                                console.log(teacherEmail);

                                                var emailto = teacherEmail;
                                                /*email message*/
                                                var emailmessage = '<strong> Hi '+teacherFname+' '+teacherLname+', </strong><br>';
                                                emailmessage += 'GoTuition : New Help A Kid Study Request'; 
                                                emailmessage += '<br>';   
                                                emailmessage += 'Go and Check : '+baseurl+'/user/teacher/help-a-kid-request/'+req.body.helpAKidId;   
                                                emailmessage += '<br>';  
                                                emailmessage += '<br>';   
                                                 
                                                /*send email*/
                                                shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to teacher*/


                                            } 

                                            if(alertKidFreeTeachRequest=="On" && (alertType=='SMS' || alertType=='Both')){

                                                console.log('sms');
                                                console.log(teacherPhone);
                                                
                                                /*sms message*/
                                                var smsmessage = 'Hi '+teacherFname+',';
                                                smsmessage += ' GoTuition New Help A Kid Study Request'; 
                                                smsmessage += ' : '+baseurl+'/user/teacher/help-a-kid-request/'+req.body.helpAKidId;   
                                                /*sms*/
                                                shared.sendsms(teacherPhone, smsmessage);/*send otp by sms*/ 
                                                 
                                            } 


                                            if(alertKidFreeTeachRequest=="On" && teacherWebPushSubscription != ""){

                                                console.log('desktopnotification');
                                                 
                                                var subscription =  JSON.parse(teacherWebPushSubscription);

                                                console.log(subscription);
                                 
                                                var title = "New Help A Kid Request";

                                                var content = "New Help A Kid Request On Your Subject";
                                                /* desktopnotification */
                                                shared.sendNotifications(title, content, subscription);
                                              
                                            } 


                                        }  else {

                                            console.log('snooze prevention');
                                        }
                                          
                                       

                                    });

                                })
                                .catch(function (err) {
                                    
                                    console.log(err);
     
                                });

                            }


                            callback(200, "Updated Successfully");/*response*/



                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update !");

                        });



                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Failed to Update !");

                    });


                 } else {

                    callback(0, "Invalid Manager Role Entry !");/*response with 401 header status*/

                 }


            } else {

                callback(0, "Invalid Manager User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed to Update !");

        });

    }

});



/*Manager : teacher public recommendations list*/
router.post('/manager-teacher-public-recommendations-list', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.getTeacherPublicRecommendationsList() /*get teacher-public-recommendations-list*/
                    .then(function(publicRecommendations){

                        console.log(publicRecommendations);
                        /*response*/
                        callback(200, "Success", publicRecommendations);/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed To Get Details !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});




/*Manager : teacher public recommendation details*/
router.post('/manager-teacher-public-recommendation-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    } else if(req.body.recommendationId == "") {

        callback(0, "Recommendation Id Should Not Be Empty !", "");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.getTeacherPublicRecommendationDetails(req.body.recommendationId) /*get teacher-public-recommendation-details*/
                    .then(function(publicRecommendation){

                        console.log(publicRecommendation);
                        /*response*/
                        callback(200, "Success", publicRecommendation[0]);/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed To Get Details !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});





/*Manager : subject - main category creation*/
router.post('/manager-subject-main-category-creation', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectCategoryName == "") {

        callback(0, "Subject Category Name Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectCategoryName" : req.body.subjectCategoryName,
                        "subjectCategoryStatus" : 'active',
                        "haveSubcategory" : 'No',
                        "haveGroup" : 'No',
                        "haveSubgroup" : 'No',
                        "haveClass" : 'No',
                        "haveTopic" : 'No',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjectcategories";

                    sharemodel.dbinsert(insertTable, insertData) /*insert main category*/
                    .then(function(){

                        /*response*/
                        callback(200, "Successfully Created New Subject Category");/*response*/
                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Category Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Category Creation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - main category single details*/
router.post('/manager-subject-main-category-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjectcategories";

                    var getCondition = {"subjectCategoryId":req.body.subjectCategoryId};

                    sharemodel.dbgetdetails(["subjectCategoryId","subjectCategoryName","subjectCategoryStatus"], getTable, getCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            console.log(catData);

                            /*response*/
                            callback(200, "Success", catData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Category !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});




/*Manager : subject - main category edit*/
router.post('/manager-subject-main-category-edit', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectCategoryName == "") { 

        callback(0, "Subject Category Name Should Not Be Empty !");

    } else if (req.body.subjectCategoryStatus == "") { 

        callback(0, "Subject Category Status Should Not Be Empty !");

    } else if (req.body.subjectCategoryStatus != "active" && req.body.subjectCategoryStatus != "not_active") { 

        callback(0, "Invalid Subject Category Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjectcategories";

                    var updateCondition = {"subjectCategoryId":req.body.subjectCategoryId};

                    sharemodel.dbgetdetails("subjectCategoryId", updateTable, updateCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            console.log(catData);

                            var updateData = {

                                "subjectCategoryName" : req.body.subjectCategoryName,
                                "subjectCategoryStatus" : req.body.subjectCategoryStatus,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit main category*/
                            .then(function(){

                                /*response*/
                                callback(200, "Successfully Updated");/*response*/
                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Subject Category Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Category !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Category Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Category Updation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - sub category creation*/
router.post('/manager-subject-sub-category-creation', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryName == "") {

        callback(0, "Subject Subcategory Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectSubcategoryName" : req.body.subjectSubcategoryName,
                        "subjectCategoryId" : req.body.subjectCategoryId,
                        "subjectSubcategoryStatus" : 'active',
                        "haveGroup" : 'No',
                        "haveSubgroup" : 'No',
                        "haveClass" : 'No',
                        "haveTopic" : 'No',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjectsubcategories";

                    sharemodel.dbinsert(insertTable, insertData) /*insert main sub category*/
                    .then(function(){

                        var updateCatTable = "subjectcategories";

                        var updateCatData = {"haveSubcategory":"Yes"};

                        var updateCatCondition = {"subjectCategoryId":req.body.subjectCategoryId};

                        sharemodel.dbupdate(updateCatTable, updateCatData, updateCatCondition) /*haveSubcategory on main category table*/
                        .then(function(){

                            /*response*/
                            callback(200, "Successfully Created New Subject Subcategory");/*response*/

                        })
                        .catch(function(err){

                            console.log(err);
                            callback(0, "Subject Subcategory Creation Failed !");/*response*/

                        });

                      
                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Subcategory Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Subcategory Creation Failed !");/*response*/

        });
    }
    

});



/*Manager : subject - sub category single details*/
router.post('/manager-subject-sub-category-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {  

        callback(0, "Subject Subcategory Id Should Not Be Empty !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjectsubcategories";

                    var getCondition = {"subjectSubcategoryId":req.body.subjectSubcategoryId};

                    sharemodel.dbgetdetails(["subjectSubcategoryId","subjectSubcategoryName","subjectCategoryId","subjectSubcategoryStatus"], getTable, getCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            console.log(catData);

                            /*response*/
                            callback(200, "Success", catData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Subcategory !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});





/*Manager : subject - sub category edit*/
router.post('/manager-subject-sub-category-edit', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {  

        callback(0, "Subject Subcategory Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryName == "") { 

        callback(0, "Subject Subcategory Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if (req.body.subjectSubcategoryStatus == "") { 

        callback(0, "Subject Subcategory Status Should Not Be Empty !");

    } else if (req.body.subjectSubcategoryStatus != "active" && req.body.subjectSubcategoryStatus != "not_active") { 

        callback(0, "Invalid Subcategory Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjectsubcategories";

                    var updateCondition = {"subjectSubcategoryId":req.body.subjectSubcategoryId};

                    sharemodel.dbgetdetails(["subjectSubcategoryId","subjectCategoryId"], updateTable, updateCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            var oldSubjectCategoryId = catData[0].subjectCategoryId;

                            console.log(catData);

                            var updateData = {

                                "subjectSubcategoryName" : req.body.subjectSubcategoryName,
                                "subjectSubcategoryStatus" : req.body.subjectSubcategoryStatus,
                                "subjectCategoryId" : req.body.subjectCategoryId,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit sub category*/
                            .then(function(){

                                if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                                    console.log('subjectcategories : haveSubcategory:Yes');

                                    sharemodel.dbupdate("subjectcategories", {"haveSubcategory":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveSubcategory on category table*/

                                }
 
                                var getHaveCondition = {"subjectCategoryId":oldSubjectCategoryId};

                                sharemodel.dbgetdetails("subjectSubcategoryId", updateTable, getHaveCondition) /*check category with subcategory exists or not*/
                                .then(function (catHaveData) {

                                    if(catHaveData.length > 0){ /*if category with subcategory exists*/

                                        console.log('Yes');


                                        sharemodel.dbupdate("subjectcategories", {"haveSubcategory":"Yes"}, getHaveCondition) /*update main category table with categoryId have or not subcategory*/
                                        .then(function(){

                                            /*response*/
                                            callback(200, "Successfully Updated");/*response*/

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
                                            callback(0, "Updation Failed !");/*response*/

                                        });


                                    } else { /*if category with subcategory not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectcategories", {"haveSubcategory":"No"}, getHaveCondition) /*update main category table with categoryId have or not subcategory*/
                                        .then(function(){

                                            /*response*/
                                            callback(200, "Successfully Updated");/*response*/

                                        })
                                        .catch(function(err){

                                            console.log(err);
                                            callback(0, "Updation Failed !");/*response*/

                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Updation Failed !");/*response*/

                                });
                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Subcategory !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Updation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - group creation*/
router.post('/manager-subject-group-creation', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectGroupName == "") {

        callback(0, "Subject Group Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectGroupName" : req.body.subjectGroupName,
                        "subjectCategoryId" : req.body.subjectCategoryId,
                        "subjectSubcategoryId" : req.body.subjectSubcategoryId,
                        "subjectGroupStatus" : 'active',
                        "haveSubgroup" : 'No',
                        "haveClass" : 'No',
                        "haveTopic" : 'No',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjectgroups";

                    sharemodel.dbinsert(insertTable, insertData) /*insert group*/
                    .then(function(){

                        if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                            console.log('subjectcategories : haveGroup:Yes');

                            sharemodel.dbupdate("subjectcategories", {"haveGroup":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveGroup on category table*/

                        }

                        if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Subcategory Is Selected */

                            console.log('subjectsubcategories : haveGroup:Yes');

                            sharemodel.dbupdate("subjectsubcategories", {"haveGroup":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveGroup on subcategory table*/

                        }


                        /*response*/
                        callback(200, "Successfully Created New Subject Group");/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Group Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Group Creation Failed !");/*response*/

        });
    }
    

});





/*Manager : subject - group single details*/
router.post('/manager-subject-group-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if(req.body.subjectGroupId == "") {  

        callback(0, "Subject Group Id Should Not Be Empty !","");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjectgroups";

                    var getCondition = {"subjectGroupId":req.body.subjectGroupId};

                    var getFields = ["subjectGroupId", "subjectGroupName", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupStatus"];

                    sharemodel.dbgetdetails(getFields, getTable, getCondition) /*check category exists or not*/
                    .then(function (grpData) {

                        if(grpData.length > 0){

                            console.log(grpData);

                            /*response*/
                            callback(200, "Success", grpData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Group !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});





/*Manager : subject - group edit*/
router.post('/manager-subject-group-edit', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectGroupId == "") {  

        callback(0, "Subject Group Id Should Not Be Empty !");

    } else if(req.body.subjectGroupName == "") { 

        callback(0, "Subject Group Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") { 

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if (req.body.subjectGroupStatus == "") { 

        callback(0, "Subject Group Status Should Not Be Empty !");

    } else if (req.body.subjectGroupStatus != "active" && req.body.subjectGroupStatus != "not_active") { 

        callback(0, "Invalid Group Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjectgroups";

                    var updateCondition = {"subjectGroupId":req.body.subjectGroupId};

                    sharemodel.dbgetdetails(["subjectGroupId", "subjectCategoryId", "subjectSubcategoryId"], updateTable, updateCondition) /*check group exists or not*/
                    .then(function (grpData) {

                        if(grpData.length > 0){

                            var oldSubjectCategoryId = grpData[0].subjectCategoryId;

                            var oldSubjectSubcategoryId = grpData[0].subjectSubcategoryId;

                            console.log(grpData);

                            var updateData = {

                                "subjectGroupName" : req.body.subjectGroupName,
                                "subjectCategoryId" : req.body.subjectCategoryId,
                                "subjectSubcategoryId" : req.body.subjectSubcategoryId,
                                "subjectGroupStatus" : req.body.subjectGroupStatus,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit group*/
                            .then(function(){


                                if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                                    console.log('subjectcategories : haveGroup:Yes');

                                    sharemodel.dbupdate("subjectcategories", {"haveGroup":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveGroup on category table*/

                                }


                                if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Sub Category Is Selected */

                                    console.log('subjectsubcategories; : haveGroup:Yes');

                                    sharemodel.dbupdate("subjectsubcategories", {"haveGroup":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveGroup on subcategory table*/

                                }


                                /*Table : subjectcategories*/
                                var getHaveCondition1 = {"subjectCategoryId":oldSubjectCategoryId};

                                sharemodel.dbgetdetails("subjectGroupId", updateTable, getHaveCondition1) /*check category with group exists or not*/
                                .then(function (catHaveData) {

                                    if(catHaveData.length > 0){ /*if category with group exists*/

                                        console.log('Yes');


                                        sharemodel.dbupdate("subjectcategories", {"haveGroup":"Yes"}, getHaveCondition1) /*update main category table with haveGroup*/
                                        .then(function(){

                                            console.log("Recheck after update new : update main category table with haveGroup : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if category with group not exists*/

                                         console.log('No');


                                        sharemodel.dbupdate("subjectcategories", {"haveGroup":"No"}, getHaveCondition1) /*update main category table with haveGroup*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update main category table with haveGroup : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*Table : subjectsubcategories*/
                                var getHaveCondition2 = {"subjectSubcategoryId":oldSubjectSubcategoryId};

                                sharemodel.dbgetdetails("subjectGroupId", updateTable, getHaveCondition2) /*check subcategory with group exists or not*/
                                .then(function (subcatHaveData) {

                                    if(subcatHaveData.length > 0){ /*if subcategory with group exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveGroup":"Yes"}, getHaveCondition2) /*update sub category table with haveGroup*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subcategory table with haveGroup : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subcategory with group not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveGroup":"No"}, getHaveCondition2) /*update sub category table with haveGroup*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subcategory table with haveGroup : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*response*/
                                callback(200, "Successfully Updated");/*response*/

                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Group !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Updation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - subgroup creation*/
router.post('/manager-subject-subgroup-creation', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectSubgroupName == "") {

        callback(0, "Subject Subgroup Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {

        callback(0, "Subject Group Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectSubgroupName" : req.body.subjectSubgroupName,
                        "subjectCategoryId" : req.body.subjectCategoryId,
                        "subjectSubcategoryId" : req.body.subjectSubcategoryId, 
                        "subjectGroupId" : req.body.subjectGroupId,
                        "subjectSubgroupStatus" : 'active',
                        "haveClass" : 'No',
                        "haveTopic" : 'No',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjectsubgroups";

                    sharemodel.dbinsert(insertTable, insertData) /*insert group*/
                    .then(function(){

                        if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                            console.log('subjectcategories : haveSubgroup:Yes');

                            sharemodel.dbupdate("subjectcategories", {"haveSubgroup":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveSubgroup on category table*/

                        }

                        if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Subcategory Is Selected */

                            console.log('subjectsubcategories : haveSubgroup:Yes');

                            sharemodel.dbupdate("subjectsubcategories", {"haveSubgroup":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveSubgroup on subcategory table*/

                        }

                        if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                            console.log('subjectgroups : haveSubgroup:Yes');

                            sharemodel.dbupdate("subjectgroups", {"haveSubgroup":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveSubgroup on Group table*/

                        }


                        /*response*/
                        callback(200, "Successfully Created New Subject Subgroup");/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Subgroup Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Subgroup Creation Failed !");/*response*/

        });
    }
    

});





/*Manager : subject - subgroup single details*/
router.post('/manager-subject-subgroup-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if(req.body.subjectSubgroupId == "") {  

        callback(0, "Subject Subgroup Id Should Not Be Empty !","");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjectsubgroups";

                    var getCondition = {"subjectSubgroupId":req.body.subjectSubgroupId};

                    var getFields = ["subjectSubgroupId", "subjectSubgroupName", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId", "subjectSubgroupStatus"];

                    sharemodel.dbgetdetails(getFields, getTable, getCondition) /*check subgroup exists or not*/
                    .then(function (sgrpData) {

                        if(sgrpData.length > 0){

                            console.log(sgrpData);

                            /*response*/
                            callback(200, "Success", sgrpData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Subgroup !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});





/*Manager : subject - subgroup edit*/
router.post('/manager-subject-subgroup-edit', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectSubgroupId == "") {  

        callback(0, "Subject Subgroup Id Should Not Be Empty !");

    } else if(req.body.subjectSubgroupName == "") { 

        callback(0, "Subject Subgroup Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") { 

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {  

        callback(0, "Subject Group Id Should Not Be Empty !");

    } else if (req.body.subjectSubgroupStatus == "") { 

        callback(0, "Subject Subgroup Status Should Not Be Empty !");

    } else if (req.body.subjectSubgroupStatus != "active" && req.body.subjectSubgroupStatus != "not_active") { 

        callback(0, "Invalid Subgroup Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjectsubgroups";

                    var updateCondition = {"subjectSubgroupId":req.body.subjectSubgroupId};

                    sharemodel.dbgetdetails(["subjectSubgroupId", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId"], updateTable, updateCondition) /*check subgroup exists or not*/
                    .then(function (sgrpData) {

                        if(sgrpData.length > 0){

                            var oldSubjectCategoryId = sgrpData[0].subjectCategoryId;

                            var oldSubjectSubcategoryId = sgrpData[0].subjectSubcategoryId;

                            var oldSubjectGroupId = sgrpData[0].subjectGroupId;

                            console.log(sgrpData);

                            var updateData = {

                                "subjectSubgroupName" : req.body.subjectSubgroupName,
                                "subjectCategoryId" : req.body.subjectCategoryId,
                                "subjectSubcategoryId" : req.body.subjectSubcategoryId,
                                "subjectGroupId" : req.body.subjectGroupId,
                                "subjectSubgroupStatus" : req.body.subjectSubgroupStatus,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit subgroup*/
                            .then(function(){


                                if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                                    console.log('subjectcategories : haveSubgroup:Yes');

                                    sharemodel.dbupdate("subjectcategories", {"haveSubgroup":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveSubgroup on category table*/

                                }


                                if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Sub Category Is Selected */

                                    console.log('subjectsubcategories : haveSubgroup:Yes');

                                    sharemodel.dbupdate("subjectsubcategories", {"haveSubgroup":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveSubgroup on subcategory table*/

                                }

                                if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                                    console.log('subjectgroups : haveSubgroup:Yes');

                                    sharemodel.dbupdate("subjectgroups", {"haveSubgroup":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveSubgroup on group table*/

                                }


                                /*Table : subjectcategories*/
                                var getHaveCondition1 = { "subjectCategoryId":oldSubjectCategoryId };

                                sharemodel.dbgetdetails("subjectSubgroupId", updateTable, getHaveCondition1) /*check category with group exists or not*/
                                .then(function (catHaveData) {

                                    if(catHaveData.length > 0){ /*if category with subgroup exists*/

                                        console.log('Yes');


                                        sharemodel.dbupdate("subjectcategories", {"haveSubgroup":"Yes"}, getHaveCondition1) /*update main category table with haveSubgroup*/
                                        .then(function(){

                                            console.log("Recheck after update new : update main category table with haveSubgroup : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if category with subgroup not exists*/

                                         console.log('No');


                                        sharemodel.dbupdate("subjectcategories", {"haveSubgroup":"No"}, getHaveCondition1) /*update main category table with haveSubgroup*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update main category table with haveSubgroup : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*Table : subjectsubcategories*/
                                var getHaveCondition2 = {"subjectSubcategoryId":oldSubjectSubcategoryId};

                                sharemodel.dbgetdetails("subjectSubgroupId", updateTable, getHaveCondition2) /*check subcategory with subgroup exists or not*/
                                .then(function (subcatHaveData) {

                                    if(subcatHaveData.length > 0){ /*if subcategory with subgroup exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveSubgroup":"Yes"}, getHaveCondition2) /*update sub category table with haveSubgroup*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subcategory table with haveSubgroup : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subcategory with subgroup not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveSubgroup":"No"}, getHaveCondition2) /*update sub category table with haveSubgroup*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subcategory table with haveSubgroup : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*Table : subjectgroups*/
                                var getHaveCondition3 = {"subjectGroupId":oldSubjectGroupId}; 

                                sharemodel.dbgetdetails("subjectSubgroupId", updateTable, getHaveCondition3) /*check group with subgroup exists or not*/
                                .then(function (grpHaveData) {

                                    if(grpHaveData.length > 0){ /*if group with subgroup exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectgroups", {"haveSubgroup":"Yes"}, getHaveCondition3) /*update group table with haveSubgroup*/
                                        .then(function(){

                                            console.log("Recheck after update new : update group table with haveSubgroup : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if group with subgroup not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectgroups", {"haveSubgroup":"No"}, getHaveCondition3) /*update group table with haveSubgroup*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update group table with haveSubgroup : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*response*/
                                callback(200, "Successfully Updated");/*response*/

                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Subgroup !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Updation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - class creation*/
router.post('/manager-subject-class-creation', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectClassName == "") {

        callback(0, "Subject Class Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {

        callback(0, "Subject Group Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else if(req.body.subjectSubgroupId == "") {

        callback(0, "Subject Subgroup Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectClassName" : req.body.subjectClassName,
                        "subjectCategoryId" : req.body.subjectCategoryId,
                        "subjectSubcategoryId" : req.body.subjectSubcategoryId, 
                        "subjectGroupId" : req.body.subjectGroupId,
                        "subjectSubgroupId" : req.body.subjectSubgroupId,
                        "subjectClassStatus" : 'active',
                        "haveTopic" : 'No',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjectclasses";

                    sharemodel.dbinsert(insertTable, insertData) /*insert class*/
                    .then(function(){

                        if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                            console.log('subjectcategories : haveClass:Yes');

                            sharemodel.dbupdate("subjectcategories", {"haveClass":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveClass on category table*/

                        }

                        if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Subcategory Is Selected */

                            console.log('subjectsubcategories : haveClass:Yes');

                            sharemodel.dbupdate("subjectsubcategories", {"haveClass":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveClass on subcategory table*/

                        }

                        if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                            console.log('subjectgroups : haveClass:Yes');

                            sharemodel.dbupdate("subjectgroups", {"haveClass":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveClass on Group table*/

                        }


                        if( req.body.subjectSubgroupId != 0 ){ /*If Subject Subgroup Is Selected */

                            console.log('subjectsubgroups : haveClass:Yes');

                            sharemodel.dbupdate("subjectsubgroups", {"haveClass":"Yes"}, {"subjectSubgroupId":req.body.subjectSubgroupId}); /*haveClass on Subgroup table*/

                        }



                        /*response*/
                        callback(200, "Successfully Created New Subject Class");/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Class Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Class Creation Failed !");/*response*/

        });
    }
    

});





/*Manager : subject - class single details*/
router.post('/manager-subject-class-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if(req.body.subjectClassId == "") {  

        callback(0, "Subject Class Id Should Not Be Empty !","");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjectclasses";

                    var getCondition = {"subjectClassId":req.body.subjectClassId};

                    var getFields = ["subjectClassId", "subjectClassName", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId", "subjectSubgroupId", "subjectClassStatus"];

                    sharemodel.dbgetdetails(getFields, getTable, getCondition) /*check class exists or not*/
                    .then(function (classData) {

                        if(classData.length > 0){

                            console.log(classData);

                            /*response*/
                            callback(200, "Success", classData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Class !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});






/*Manager : subject - class edit*/
router.post('/manager-subject-class-edit', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectClassId == "") {  

        callback(0, "Subject Class Id Should Not Be Empty !");

    } else if(req.body.subjectClassName == "") { 

        callback(0, "Subject Class Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") { 

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {  

        callback(0, "Subject Group Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else if(req.body.subjectSubgroupId == "") {  

        callback(0, "Subject Subgroup Id Should Not Be Empty. It Should Be Subgroup Id OR 0 !");

    } else if (req.body.subjectClassStatus == "") { 

        callback(0, "Subject Class Status Should Not Be Empty !");

    } else if (req.body.subjectClassStatus != "active" && req.body.subjectClassStatus != "not_active") { 

        callback(0, "Invalid Class Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjectclasses";

                    var updateCondition = {"subjectClassId":req.body.subjectClassId};

                    sharemodel.dbgetdetails(["subjectClassId", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId", "subjectSubgroupId"], updateTable, updateCondition) /*check subgroup exists or not*/
                    .then(function (classData) {

                        if(classData.length > 0){

                            var oldSubjectCategoryId = classData[0].subjectCategoryId;

                            var oldSubjectSubcategoryId = classData[0].subjectSubcategoryId;

                            var oldSubjectGroupId = classData[0].subjectGroupId;

                            var oldSubjectSubgroupId = classData[0].subjectSubgroupId;

                            console.log(classData);

                            var updateData = {

                                "subjectClassName" : req.body.subjectClassName,
                                "subjectCategoryId" : req.body.subjectCategoryId,
                                "subjectSubcategoryId" : req.body.subjectSubcategoryId,
                                "subjectGroupId" : req.body.subjectGroupId,
                                "subjectSubgroupId" : req.body.subjectSubgroupId,
                                "subjectClassStatus" : req.body.subjectClassStatus,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit class*/
                            .then(function(){


                                if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                                    console.log('subjectcategories : haveClass:Yes');

                                    sharemodel.dbupdate("subjectcategories", {"haveClass":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveClass on category table*/

                                }


                                if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Sub Category Is Selected */

                                    console.log('subjectsubcategories : haveClass:Yes');

                                    sharemodel.dbupdate("subjectsubcategories", {"haveClass":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveClass on subcategory table*/

                                }

                                if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                                    console.log('subjectgroups : haveClass:Yes');

                                    sharemodel.dbupdate("subjectgroups", {"haveClass":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveClass on group table*/

                                }

                                if( req.body.subjectSubgroupId != 0 ){ /*If Subject Subgroup Is Selected */

                                    console.log('subjectsubgroups : haveClass:Yes');

                                    sharemodel.dbupdate("subjectsubgroups", {"haveClass":"Yes"}, {"subjectSubgroupId":req.body.subjectSubgroupId}); /*haveClass on subgroup table*/

                                }


                                /*Table : subjectcategories*/
                                var getHaveCondition1 = { "subjectCategoryId":oldSubjectCategoryId };

                                sharemodel.dbgetdetails("subjectClassId", updateTable, getHaveCondition1) /*check category with class exists or not*/
                                .then(function (catHaveData) {

                                    if(catHaveData.length > 0){ /*if category with class exists*/

                                        console.log('Yes');


                                        sharemodel.dbupdate("subjectcategories", {"haveClass":"Yes"}, getHaveCondition1) /*update main category table with haveClass*/
                                        .then(function(){

                                            console.log("Recheck after update new : update main category table with haveClass : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if category with class not exists*/

                                         console.log('No');


                                        sharemodel.dbupdate("subjectcategories", {"haveClass":"No"}, getHaveCondition1) /*update main category table with haveClass*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update main category table with haveClass : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*Table : subjectsubcategories*/
                                var getHaveCondition2 = {"subjectSubcategoryId":oldSubjectSubcategoryId};

                                sharemodel.dbgetdetails("subjectClassId", updateTable, getHaveCondition2) /*check subcategory with class exists or not*/
                                .then(function (subcatHaveData) {

                                    if(subcatHaveData.length > 0){ /*if subcategory with class exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveClass":"Yes"}, getHaveCondition2) /*update sub category table with haveClass*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subcategory table with haveClass : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subcategory with class not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveClass":"No"}, getHaveCondition2) /*update sub category table with haveClass*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subcategory table with haveClass : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                


                                  /*Table : subjectgroups*/
                                var getHaveCondition3 = {"subjectGroupId":oldSubjectGroupId}; 

                                sharemodel.dbgetdetails("subjectClassId", updateTable, getHaveCondition3) /*check group with class exists or not*/
                                .then(function (grpHaveData) {

                                    if(grpHaveData.length > 0){ /*if group with class exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectgroups", {"haveClass":"Yes"}, getHaveCondition3) /*update group table with haveClass*/
                                        .then(function(){

                                            console.log("Recheck after update new : update group table with haveClass : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if group with class not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectgroups", {"haveClass":"No"}, getHaveCondition3) /*update group table with haveClass*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update group table with haveClass : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });


                                /*Table : subjectsubgroups*/
                                var getHaveCondition4 = {"subjectSubgroupId":oldSubjectSubgroupId}; 

                                sharemodel.dbgetdetails("subjectClassId", updateTable, getHaveCondition4) /*check subgroup with class exists or not*/
                                .then(function (sgrpHaveData) {

                                    if(sgrpHaveData.length > 0){ /*if subgroup with class exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubgroups", {"haveClass":"Yes"}, getHaveCondition4) /*update subgroup table with haveClass*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subgroup table with haveClass : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subgroup with class not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubgroups", {"haveClass":"No"}, getHaveCondition4) /*update subgroup table with haveClass*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subgroup table with haveClass : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*response*/
                                callback(200, "Successfully Updated");/*response*/

                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Class !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Updation Failed !");/*response*/

        });
    }
    

});

 


/*Manager : subject - topic creation*/
router.post('/manager-subject-topic-creation', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if(req.body.subjectTopicName == "") {

        callback(0, "Subject Topic Name Should Not Be Empty !");

    } else if(req.body.subjectTopicDisplayName == "") {

        callback(0, "Subject Topic Display Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") {

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {

        callback(0, "Subject Group Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else if(req.body.subjectSubgroupId == "") {

        callback(0, "Subject Subgroup Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else if(req.body.subjectClassId == "") {

        callback(0, "Subject Class Id Should Not Be Empty. It Should Be Class Id OR 0 !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var insertData = {

                        "subjectTopicName" : req.body.subjectTopicName,
                        "subjectTopicDisplayName" : req.body.subjectTopicDisplayName,
                        "subjectCategoryId" : req.body.subjectCategoryId,
                        "subjectSubcategoryId" : req.body.subjectSubcategoryId, 
                        "subjectGroupId" : req.body.subjectGroupId,
                        "subjectSubgroupId" : req.body.subjectSubgroupId, 
                        "subjectClassId" : req.body.subjectClassId,
                        "subjectTopicStatus" : 'active',
                        "createdBy" : managerUserId,
                        "createdOn" :  dateymd,
                        "updatedOn" : dateymd

                    };

                    var insertTable = "subjecttopics";

                    sharemodel.dbinsert(insertTable, insertData) /*insert topic*/
                    .then(function(){

                        if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                            console.log('subjectcategories : haveTopic:Yes');

                            sharemodel.dbupdate("subjectcategories", {"haveTopic":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveTopic on category table*/

                        }

                        if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Subcategory Is Selected */

                            console.log('subjectsubcategories : haveTopic:Yes');

                            sharemodel.dbupdate("subjectsubcategories", {"haveTopic":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveTopic on subcategory table*/

                        }

                        if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                            console.log('subjectgroups : haveTopic:Yes');

                            sharemodel.dbupdate("subjectgroups", {"haveTopic":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveTopic on Group table*/

                        }


                        if( req.body.subjectSubgroupId != 0 ){ /*If Subject Subgroup Is Selected */

                            console.log('subjectsubgroups : haveTopic:Yes');

                            sharemodel.dbupdate("subjectsubgroups", {"haveTopic":"Yes"}, {"subjectSubgroupId":req.body.subjectSubgroupId}); /*haveTopic on Subgroup table*/

                        }

                         if( req.body.subjectClassId != 0 ){ /*If Subject Class Is Selected */

                            console.log('subjectclasses : haveTopic:Yes');

                            sharemodel.dbupdate("subjectclasses", {"haveTopic":"Yes"}, {"subjectClassId":req.body.subjectClassId}); /*haveTopic on class table*/

                        }



                        /*response*/
                        callback(200, "Successfully Created New Subject Topic");/*response*/

                        
                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Subject Topic Creation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Subject Topic Creation Failed !");/*response*/

        });
    }
    

});




/*Manager : subject - Topic single details*/
router.post('/manager-subject-topic-single-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message,"details":details});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if(req.body.subjectTopicId == "") {  

        callback(0, "Subject Topic Id Should Not Be Empty !","");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var getTable = "subjecttopics";

                    var getCondition = {"subjectTopicId":req.body.subjectTopicId};

                    var getFields = ["subjectTopicId", "subjectTopicName", "subjectTopicDisplayName", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId", "subjectSubgroupId", "subjectClassId", "subjectTopicStatus"];

                    sharemodel.dbgetdetails(getFields, getTable, getCondition) /*check topic exists or not*/
                    .then(function (topicData) {

                        if(topicData.length > 0){

                            console.log(topicData);

                            /*response*/
                            callback(200, "Success", topicData[0]);/*response*/
                        

                        } else {

                            callback(0, "Invalid Topic !", "");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {   

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }
    

});





/*Manager : subject - topic edit*/
router.post('/manager-subject-topic-edit', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }

 
    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");  

    } else if(req.body.subjectTopicId == "") {  

        callback(0, "Subject Topic Id Should Not Be Empty !");

    } else if(req.body.subjectTopicName == "") { 

        callback(0, "Subject Topic Name Should Not Be Empty !");

    } else if(req.body.subjectTopicDisplayName == "") {

        callback(0, "Subject Topic Display Name Should Not Be Empty !");

    }  else if(req.body.subjectCategoryId == "") {  

        callback(0, "Subject Category Id Should Not Be Empty !");

    } else if(req.body.subjectSubcategoryId == "") { 

        callback(0, "Subject Subcategory Id Should Not Be Empty. It Should Be Subcategory Id OR 0 !");

    } else if(req.body.subjectGroupId == "") {  

        callback(0, "Subject Group Id Should Not Be Empty. It Should Be Group Id OR 0 !");

    } else if(req.body.subjectSubgroupId == "") {  

        callback(0, "Subject Subgroup Id Should Not Be Empty. It Should Be Subgroup Id OR 0 !");

    } else if(req.body.subjectClassId == "") {  

        callback(0, "Subject Class Id Should Not Be Empty. It Should Be Class Id OR 0  !");

    } else if (req.body.subjectTopicStatus == "") { 

        callback(0, "Subject Topic Status Should Not Be Empty !");

    } else if (req.body.subjectTopicStatus != "active" && req.body.subjectTopicStatus != "not_active") { 

        callback(0, "Invalid Topic Status. Allowed Status Are 'active' OR 'not_active' !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var updateTable = "subjecttopics";

                    var updateCondition = {"subjectTopicId":req.body.subjectTopicId};

                    sharemodel.dbgetdetails(["subjectTopicId", "subjectCategoryId", "subjectSubcategoryId", "subjectGroupId", "subjectSubgroupId", "subjectClassId"], updateTable, updateCondition) /*check topic exists or not*/
                    .then(function (topicData) {

                        if(topicData.length > 0){

                            var oldSubjectCategoryId = topicData[0].subjectCategoryId;

                            var oldSubjectSubcategoryId = topicData[0].subjectSubcategoryId;

                            var oldSubjectGroupId = topicData[0].subjectGroupId;

                            var oldSubjectSubgroupId = topicData[0].subjectSubgroupId;

                            var oldSubjectClassId = topicData[0].subjectClassId;

                            console.log(topicData);

                            var updateData = { 

                                "subjectTopicName" : req.body.subjectTopicName,
                                "subjectTopicDisplayName" : req.body.subjectTopicDisplayName,
                                "subjectCategoryId" : req.body.subjectCategoryId,
                                "subjectSubcategoryId" : req.body.subjectSubcategoryId,
                                "subjectGroupId" : req.body.subjectGroupId,
                                "subjectSubgroupId" : req.body.subjectSubgroupId,
                                "subjectClassId" : req.body.subjectClassId,
                                "subjectTopicStatus" : req.body.subjectTopicStatus,
                                "updatedOn" : dateymd

                            };

                            sharemodel.dbupdate(updateTable, updateData, updateCondition) /*edit class*/
                            .then(function(){


                                if( req.body.subjectCategoryId != 0 ){ /*If Subject Category Is Selected */

                                    console.log('subjectcategories : haveTopic:Yes');

                                    sharemodel.dbupdate("subjectcategories", {"haveTopic":"Yes"}, {"subjectCategoryId":req.body.subjectCategoryId}); /*haveTopic on category table*/

                                }


                                if( req.body.subjectSubcategoryId != 0 ){ /*If Subject Sub Category Is Selected */

                                    console.log('subjectsubcategories : haveTopic:Yes');

                                    sharemodel.dbupdate("subjectsubcategories", {"haveTopic":"Yes"}, {"subjectSubcategoryId":req.body.subjectSubcategoryId}); /*haveTopic on subcategory table*/

                                }

                                if( req.body.subjectGroupId != 0 ){ /*If Subject Group Is Selected */

                                    console.log('subjectgroups : haveTopic:Yes');

                                    sharemodel.dbupdate("subjectgroups", {"haveTopic":"Yes"}, {"subjectGroupId":req.body.subjectGroupId}); /*haveTopic on group table*/

                                }

                                if( req.body.subjectSubgroupId != 0 ){ /*If Subject Subgroup Is Selected */

                                    console.log('subjectsubgroups : haveTopic:Yes');

                                    sharemodel.dbupdate("subjectsubgroups", {"haveTopic":"Yes"}, {"subjectSubgroupId":req.body.subjectSubgroupId}); /*haveTopic on subgroup table*/

                                }


                                 if( req.body.subjectClassId != 0 ){ /*If Subject class Is Selected */

                                    console.log('subjectclasses : haveTopic:Yes');

                                    sharemodel.dbupdate("subjectclasses", {"haveTopic":"Yes"}, {"subjectClassId":req.body.subjectClassId}); /*haveTopic on class table*/

                                }


                                /*Table : subjectcategories*/
                                var getHaveCondition1 = { "subjectCategoryId":oldSubjectCategoryId };

                                sharemodel.dbgetdetails("subjectTopicId", updateTable, getHaveCondition1) /*check category with topic exists or not*/
                                .then(function (catHaveData) {

                                    if(catHaveData.length > 0){ /*if category with topic exists*/

                                        console.log('Yes');


                                        sharemodel.dbupdate("subjectcategories", {"haveTopic":"Yes"}, getHaveCondition1) /*update main category table with haveTopic*/
                                        .then(function(){

                                            console.log("Recheck after update new : update main category table with haveTopic : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if category with topic not exists*/

                                         console.log('No');


                                        sharemodel.dbupdate("subjectcategories", {"haveTopic":"No"}, getHaveCondition1) /*update main category table with haveTopic*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update main category table with haveTopic : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*Table : subjectsubcategories*/
                                var getHaveCondition2 = {"subjectSubcategoryId":oldSubjectSubcategoryId};

                                sharemodel.dbgetdetails("subjectTopicId", updateTable, getHaveCondition2) /*check subcategory with topic exists or not*/
                                .then(function (subcatHaveData) {

                                    if(subcatHaveData.length > 0){ /*if subcategory with topic exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveTopic":"Yes"}, getHaveCondition2) /*update sub category table with haveTopic*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subcategory table with haveTopic : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subcategory with topic not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubcategories", {"haveTopic":"No"}, getHaveCondition2) /*update sub category table with haveTopic*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subcategory table with haveTopic : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                


                                /*Table : subjectgroups*/
                                var getHaveCondition3 = {"subjectGroupId":oldSubjectGroupId}; 

                                sharemodel.dbgetdetails("subjectTopicId", updateTable, getHaveCondition3) /*check group with topic exists or not*/
                                .then(function (grpHaveData) {

                                    if(grpHaveData.length > 0){ /*if group with topic exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectgroups", {"haveTopic":"Yes"}, getHaveCondition3) /*update group table with haveTopic*/
                                        .then(function(){

                                            console.log("Recheck after update new : update group table with haveTopic : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if group with topic not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectgroups", {"haveTopic":"No"}, getHaveCondition3) /*update group table with haveTopic*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update group table with haveTopic : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });


                                /*Table : subjectsubgroups*/
                                var getHaveCondition4 = {"subjectSubgroupId":oldSubjectSubgroupId}; 

                                sharemodel.dbgetdetails("subjectTopicId", updateTable, getHaveCondition4) /*check subgroup with topic exists or not*/
                                .then(function (sgrpHaveData) {

                                    if(sgrpHaveData.length > 0){ /*if subgroup with topic exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectsubgroups", {"haveTopic":"Yes"}, getHaveCondition4) /*update subgroup table with haveTopic*/
                                        .then(function(){

                                            console.log("Recheck after update new : update subgroup table with haveTopic : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if subgroup with topic not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectsubgroups", {"haveTopic":"No"}, getHaveCondition4) /*update subgroup table with haveTopic*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update subgroup table with haveTopic : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });


                                /*Table : subjectclasses*/
                                var getHaveCondition5 = {"subjectClassId":oldSubjectClassId}; 

                                sharemodel.dbgetdetails("subjectTopicId", updateTable, getHaveCondition5) /*check class with topic exists or not*/
                                .then(function (classHaveData) {

                                    if(classHaveData.length > 0){ /*if class with topic exists*/

                                        console.log('Yes');

                                        sharemodel.dbupdate("subjectclasses", {"haveTopic":"Yes"}, getHaveCondition5) /*update class table with haveTopic*/
                                        .then(function(){

                                            console.log("Recheck after update new : update class table with haveTopic : Yes");

                                        })
                                        .catch(function(err){ 

                                            console.log(err);
 
                                        });


                                    } else { /*if class with topic not exists*/

                                        console.log('No');

                                        sharemodel.dbupdate("subjectclasses", {"haveTopic":"No"}, getHaveCondition5) /*update class table with haveTopic*/
                                        .then(function(){

                                            /*response*/
                                            console.log("Recheck after update new : update class table with haveTopic : No");

                                        })
                                        .catch(function(err){

                                            console.log(err);
 
                                        });


                                    }


                                 })
                                .catch(function(err){

                                    console.log(err);
 
                                });



                                /*response*/
                                callback(200, "Successfully Updated");/*response*/

                                
                            })
                            .catch(function(err){

                                console.log(err);
                                callback(0, "Updation Failed !");/*response*/

                            });


                        } else {

                            callback(0, "Invalid Topic !");/*response*/

                        }
                        

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Updation Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !"); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Updation Failed !");/*response*/

        });
    }
    

});



/*subject categories*/
router.post('/manager-subjectcategories', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectcategories": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectcategoryreq == "01") {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.dbgetsubjectcategories(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });

    }
    else {
        callback(0, "Invalid Request !", "");
    }
});



/*subject sub categories*/
router.post('/manager-subjectsubcategories', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubcategories": details });
    }


     if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.categorysubcatreq != "012") {

        callback(0, "Invalid Request !", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                     managermodel.dbgetsubjectsubcategories(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});


/*subject sub categories by maincategories*/
router.post('/manager-subjectsubcategories-by-maincategories', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubcategories": details });
    }


     if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.categorysubcatreq != "012") {

        callback(0, "Invalid Request !", "");

    }
    else if (req.body.subjectcategoryId == "") {

        callback(0, "Subject Category Id Is Empty!", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                     managermodel.dbgetsubjectsubcategoriesbymaincat(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});


 
/*subject groups*/
router.post('/manager-subject-groups', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectgroups": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectGroupReq != "013") {

        callback(0, "Invalid Request !", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    managermodel.dbgetsubjectallgroups(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});



 
/*subject groups  by Main Category OR Sub Category */
router.post('/manager-subject-groups-by-maincat-subcat', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectgroups": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectGroupReq != "013") {

        callback(0, "Invalid Request !", "");
        
    } else if (req.body.subjectGroupRequestField == "") {

        callback(0, "Request Field Is Empty!", "");

    } else if (req.body.subjectGroupRequestFieldId == "") {

        callback(0, "Request Field Id Is Empty!", "");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.dbgetSubjectGroupsbyMaincatSubcat(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});



 
/*subject subgroups*/
router.post('/manager-subject-subgroups', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubgroups": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectSubGroupReq != "014") {

        callback(0, "Invalid Request !", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    managermodel.dbgetsubjectallsubgroups(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




 
/*subject subgroups  by Main Category OR Sub Category Or Group*/
router.post('/manager-subject-subgroups-by-maincat-subcat-group', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubgroups": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectSubGroupReq != "014") {

        callback(0, "Invalid Request !", "");
        
    } else if (req.body.subjectSubGroupRequestField == "") {

        callback(0, "Request Field Is Empty!", "");

    } else if (req.body.subjectSubGroupRequestFieldId == "") {

        callback(0, "Request Field Id Is Empty!", "");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.dbgetSubjectSubGroupsbyMaincatSubcatGroup(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




 
/*subject class*/
router.post('/manager-subject-classes', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectclasses": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    } else if (req.body.subjectClassReq != "015") {

        callback(0, "Invalid Request !", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    managermodel.dbgetsubjectallclasses(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});





 
/*subject classes by Main Category OR Sub Category OR Group OR Subgroup*/
router.post('/manager-subject-classes-by-maincat-subcat-group-subgroup', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "subjectclasses": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectClassReq != "015") {

        callback(0, "Invalid Request !", "");
        
    } else if (req.body.subjectClassRequestField == "") {

        callback(0, "Request Field Is Empty!", "");

    } else if (req.body.subjectClassRequestFieldId == "") {

        callback(0, "Request Field Id Is Empty!", "");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.dbgetSubjectClassbyMaincatSubcatGroupSubgroup(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




 
/*subject topics*/
router.post('/manager-subject-topics', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjecttopics": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !", "");

    } else if (req.body.subjectTopicReq != "016") {

        callback(0, "Invalid Request !", "");

    }
    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    managermodel.dbgetsubjectalltopics(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});



 
/*get subject topics by Main Category OR Sub Category OR Group OR Subgroup OR class*/
router.post('/manager-subject-topic-by-maincat-subcat-group-subgroup-class', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "subjecttopics": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !","");

    } else if (req.body.subjectTopicReq != "016") {

        callback(0, "Invalid Request !", "");
        
    } else if (req.body.subjectTopicRequestField == "") {

        callback(0, "Request Field Is Empty!", "");

    } else if (req.body.subjectTopicRequestFieldId == "") {

        callback(0, "Request Field Id Is Empty!", "");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    managermodel.dbgetSubjectTopicbyMaincatSubcatGroupSubgroupClass(req.body)
                    .then(function (data) {

                        callback(200, "Success", data);/*response*/

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });

                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }
 
            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});


/*check main category entries before remove subject main category */
router.post('/manager-check-subject-main-category-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectCategoryId == "") {

        callback(0, "Category Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    var catTable = "subjectcategories";

                    var catCondition = {"subjectCategoryId":req.body.subjectCategoryId};

                    sharemodel.dbgetdetails(["subjectCategoryName"], catTable, catCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            var response = [];

                            var promises = []; /*array for handling multiple query results*/

                            promises[0] = sharemodel.dbgetdetails("subjectSubcategoryId", "subjectsubcategories", catCondition);

                            promises[1] = sharemodel.dbgetdetails("subjectGroupId", "subjectgroups", catCondition);

                            promises[2] = sharemodel.dbgetdetails("subjectSubgroupId", "subjectsubgroups", catCondition);

                            promises[3] = sharemodel.dbgetdetails("subjectClassId", "subjectclasses", catCondition);

                            promises[4] = sharemodel.dbgetdetails("subjectTopicId", "subjecttopics", catCondition);

                            promises[5] = managermodel.dbGetCommaSeparatedTopics(catCondition);

                            Promise.all(promises).then(function(data){

                                // console.log(data[0]);
                                // console.log(data[1]);
                                // console.log(data[2]);
                                // console.log(data[3]);
                                // console.log(data[4]);

                                if(data[0].length==0 && data[1].length==0 && data[2].length==0 && data[3].length==0 && data[4].length==0){

                                    var dataExists =  {

                                        "subCategories":data[0].length,
                                        "groups":data[1].length,
                                        "subGroups":data[2].length,
                                        "classes":data[3].length,
                                        "topics":data[4].length,

                                    };

                                    callback(200, "Proceed" , dataExists);


                                } else {

                                    var includedTopics = data[5][0]['subjectTopicIds'];

                                    var promises2 = []; /*array for handling multiple query results*/

                                    promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                                    promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                                    promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                                    Promise.all(promises2).then(function(data2){

                                        console.log(data2);

                                        var dataExists =  {

                                            "subCategories":data[0].length,
                                            "groups":data[1].length,
                                            "subGroups":data[2].length,
                                            "classes":data[3].length,
                                            "topics":data[4].length,
                                            "teachercourses" : data2[0][0].includedTeachers,
                                            "studentcourses" : data2[1][0].includedStudents,
                                            "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                        };


                                        callback(100, "Data Exists For This Category" , dataExists);

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                        callback(0, "Failed !" , "");

                                    });

                                }

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                          
                        } else {

                            callback(0, "Invalid Category !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




 
/*remove subject main category*/
router.post('/manager-remove-subject-main-category', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectCategoryId == "") {

        callback(0, "Category Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var catTable = "subjectcategories";

                    var catCondition = {"subjectCategoryId":req.body.subjectCategoryId};

                    sharemodel.dbgetdetails(["subjectCategoryName"], catTable, catCondition) /*check category exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            /*remove category*/
                            sharemodel.dbremove(catTable, catCondition) 
                            .then(function(){


                                /*remove subcategories under main category*/
                                sharemodel.dbremove("subjectsubcategories", catCondition)
                                .then(function () {

                                    console.log('subcategories removed');

                                })
                                .catch(function(err){

                                    console.log('subcategories remove failed');
                                    console.log(err);

                                });


                                /*remove groups under main category*/
                                sharemodel.dbremove("subjectgroups", catCondition)
                                .then(function () {

                                    console.log('groups removed');

                                })
                                .catch(function(err){

                                    console.log('groups remove failed');
                                    console.log(err);

                                });



                                /*remove subgroups under main category*/
                                sharemodel.dbremove("subjectsubgroups", catCondition)
                                .then(function () {

                                    console.log('subgroups removed');

                                })
                                .catch(function(err){

                                    console.log('subgroups remove failed');
                                    console.log(err);

                                });


                                /*remove classes under main category*/
                                sharemodel.dbremove("subjectclasses", catCondition)
                                .then(function () {

                                    console.log('classes removed');

                                })
                                .catch(function(err){

                                    console.log('classes remove failed');
                                    console.log(err);

                                });

                                

                                /*get topics under category*/
                                managermodel.dbGetCommaSeparatedTopics(catCondition) /*check topics under category exists or not*/
                                .then(function (topicData) {

                                    if(topicData.length > 0){

                                        console.log(topicData);

                                        var table1 = "subjecttopics";

                                        /*remove topics*/
                                        managermodel.dbRemoveTopicsMultipleRows(table1, topicData[0]['subjectTopicIds'])
                                        .then(function () {

                                            console.log('topics removed');

                                        })
                                        .catch(function(err){

                                            console.log('topics failed');
                                            console.log(err);
     
                                        });

                                        /*remove teacher-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("teachercourses", topicData[0]['subjectTopicIds'])
                                        .then(function () {

                                            console.log('teacher-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('teacher-courses failed');
                                            console.log(err);
     
                                        });


                                        /*remove student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("studentcourses", topicData[0]['subjectTopicIds'])
                                        .then(function () {

                                            console.log('student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('student-courses failed');
                                            console.log(err);
     
                                        });


                                        /*remove parent-student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", topicData[0]['subjectTopicIds'])
                                        .then(function () {

                                            console.log('parent-student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('parent-student-courses failed');
                                            console.log(err);
     
                                        });


                                        /*remove helpakidstudy-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", topicData[0]['subjectTopicIds'])
                                        .then(function () {

                                            console.log('helpakidstudy-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('helpakidstudy-courses failed');
                                            console.log(err);
     
                                        });


                                        callback(200, "Successfully Removed");/*response*/

                                    }  


                                })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Failed !");/*response*/

                                });


                            })
                            .catch(function(err){

                                console.log('main category remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Category !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




/*check subcategory entries before remove subject subcategory */
router.post('/manager-check-subject-sub-category-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectSubcategoryId == "") {

        callback(0, "Subject Subcategory Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    var catTable = "subjectsubcategories";

                    var catCondition = {"subjectSubcategoryId":req.body.subjectSubcategoryId};

                    sharemodel.dbgetdetails(["subjectSubcategoryName"], catTable, catCondition) /*check subcategory exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

 
                            var promises = []; /*array for handling multiple query results*/

                            promises[0] = sharemodel.dbgetdetails("subjectGroupId", "subjectgroups", catCondition);

                            promises[1] = sharemodel.dbgetdetails("subjectSubgroupId", "subjectsubgroups", catCondition);

                            promises[2] = sharemodel.dbgetdetails("subjectClassId", "subjectclasses", catCondition);

                            promises[3] = sharemodel.dbgetdetails("subjectTopicId", "subjecttopics", catCondition);

                            promises[4] = managermodel.dbGetCommaSeparatedTopics(catCondition);

                            Promise.all(promises).then(function(data){

                                // console.log(data[0]);
                                // console.log(data[1]);
                                // console.log(data[2]);
                                // console.log(data[3]);
 
                                if(data[0].length==0 && data[1].length==0 && data[2].length==0 && data[3].length==0 ){

                                    var dataExists =  {

                                        "groups":data[0].length,
                                        "subGroups":data[1].length,
                                        "classes":data[2].length,
                                        "topics":data[3].length

                                    };

                                    callback(200, "Proceed" , dataExists);


                                } else {

                                    var includedTopics = data[4][0]['subjectTopicIds'];

                                    var promises2 = []; /*array for handling multiple query results*/

                                    promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                                    promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                                    promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                                    Promise.all(promises2).then(function(data2){

                                        console.log(data2);

                                        var dataExists =  {

                                            "groups":data[0].length,
                                            "subGroups":data[1].length,
                                            "classes":data[2].length,
                                            "topics":data[3].length,
                                            "teachercourses" : data2[0][0].includedTeachers,
                                            "studentcourses" : data2[1][0].includedStudents,
                                            "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                        };


                                        callback(100, "Data Exists For This SubCategory" , dataExists);

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                        callback(0, "Failed !" , "");

                                    });

                                }

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                          
                        } else {

                            callback(0, "Invalid SubCategory !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});






 
/*remove subject subcategory*/
router.post('/manager-remove-subject-sub-category', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectSubcategoryId == "") {

        callback(0, "Subcategory Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var catTable = "subjectsubcategories";

                    var catCondition = {"subjectSubcategoryId":req.body.subjectSubcategoryId};

                    sharemodel.dbgetdetails(["subjectSubcategoryName"], catTable, catCondition) /*check subcategory exists or not*/
                    .then(function (catData) {

                        if(catData.length > 0){

                            /*remove subcategory*/
                            sharemodel.dbremove(catTable, catCondition) 
                            .then(function(){
 
                                /*remove groups under subcategory*/
                                sharemodel.dbremove("subjectgroups", catCondition)
                                .then(function () {

                                    console.log('groups removed');

                                })
                                .catch(function(err){

                                    console.log('groups remove failed');
                                    console.log(err);

                                });



                                /*remove subgroups under subcategory*/
                                sharemodel.dbremove("subjectsubgroups", catCondition)
                                .then(function () {

                                    console.log('subgroups removed');

                                })
                                .catch(function(err){

                                    console.log('subgroups remove failed');
                                    console.log(err);

                                });


                                /*remove classes under subcategory*/
                                sharemodel.dbremove("subjectclasses", catCondition)
                                .then(function () {

                                    console.log('classes removed');

                                })
                                .catch(function(err){

                                    console.log('classes remove failed');
                                    console.log(err);

                                });

                                

                                /*get topics under subcategory*/
                                managermodel.dbGetCommaSeparatedTopics(catCondition) /*check topics under subcategory exists or not*/
                                .then(function (topicData) {

                                    if(topicData.length > 0){

                                        console.log(topicData);

                                        var includedTopics = topicData[0]['subjectTopicIds'];

                                        /*remove topics*/
                                        managermodel.dbRemoveTopicsMultipleRows("subjecttopics", includedTopics)
                                        .then(function () {

                                            console.log('topics removed');

                                        })
                                        .catch(function(err){

                                            console.log('topics remove failed');
                                            console.log(err);
     
                                        });

                                        /*remove teacher-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("teachercourses", includedTopics)
                                        .then(function () {

                                            console.log('teacher-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('teacher-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("studentcourses", includedTopics)
                                        .then(function () {

                                            console.log('student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove parent-student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", includedTopics)
                                        .then(function () {

                                            console.log('parent-student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('parent-student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove helpakidstudy-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", includedTopics)
                                        .then(function () {

                                            console.log('helpakidstudy-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('helpakidstudy-courses remove failed');
                                            console.log(err);
     
                                        });


                                        callback(200, "Successfully Removed");/*response*/

                                    }  


                                })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Failed !");/*response*/

                                });


                            })
                            .catch(function(err){

                                console.log('sub category remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Subcategory !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !"); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");/*response*/

        });
    }

});






/*check subject group entries before remove subject group */
router.post('/manager-check-subject-group-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectGroupId == "") {

        callback(0, "Subject Group Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    var subjectTable = "subjectgroups";

                    var subjectCondition = {"subjectGroupId":req.body.subjectGroupId};

                    sharemodel.dbgetdetails(["subjectGroupName"], subjectTable, subjectCondition) /*check group exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){

 
                            var promises = []; /*array for handling multiple query results*/

                            promises[0] = sharemodel.dbgetdetails("subjectSubgroupId", "subjectsubgroups", subjectCondition);

                            promises[1] = sharemodel.dbgetdetails("subjectClassId", "subjectclasses", subjectCondition);

                            promises[2] = sharemodel.dbgetdetails("subjectTopicId", "subjecttopics", subjectCondition);

                            promises[3] = managermodel.dbGetCommaSeparatedTopics(subjectCondition);

                            Promise.all(promises).then(function(data){

                                // console.log(data[0]);
                                // console.log(data[1]);
                                // console.log(data[2]);
                                // console.log(data[3]);
 
                                if(data[0].length==0 && data[1].length==0 && data[2].length==0 ){

                                    var dataExists =  {

                                        "subGroups":data[0].length,
                                        "classes":data[1].length,
                                        "topics":data[2].length

                                    };

                                    callback(200, "Proceed" , dataExists);


                                } else {

                                    var includedTopics = data[3][0]['subjectTopicIds'];

                                    var promises2 = []; /*array for handling multiple query results*/

                                    promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                                    promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                                    promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                                    Promise.all(promises2).then(function(data2){

                                        console.log(data2);

                                        var dataExists =  {

                                            "subGroups":data[0].length,
                                            "classes":data[1].length,
                                            "topics":data[2].length,
                                            "teachercourses" : data2[0][0].includedTeachers,
                                            "studentcourses" : data2[1][0].includedStudents,
                                            "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                        };


                                        callback(100, "Data Exists For This Group" , dataExists);

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                        callback(0, "Failed !" , "");

                                    });

                                }

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                          
                        } else {

                            callback(0, "Invalid Group !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});





/*remove subject group*/
router.post('/manager-remove-subject-group', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectGroupId == "") {

        callback(0, "Subject Group Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var subjectTable = "subjectgroups";

                    var subjectCondition = {"subjectGroupId":req.body.subjectGroupId};

                    sharemodel.dbgetdetails(["subjectGroupName"], subjectTable, subjectCondition) /*check group exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){

                            /*remove group*/
                            sharemodel.dbremove(subjectTable, subjectCondition) 
                            .then(function(){


                                /*remove subgroups under group*/
                                sharemodel.dbremove("subjectsubgroups", subjectCondition)
                                .then(function () {

                                    console.log('subgroups removed');

                                })
                                .catch(function(err){

                                    console.log('subgroups remove failed');
                                    console.log(err);

                                });


                                /*remove classes under group*/
                                sharemodel.dbremove("subjectclasses", subjectCondition)
                                .then(function () {

                                    console.log('classes removed');

                                })
                                .catch(function(err){

                                    console.log('classes remove failed');
                                    console.log(err);

                                });

                                

                                /*get topics under group*/
                                managermodel.dbGetCommaSeparatedTopics(subjectCondition) /*check topics under groups exists or not*/
                                .then(function (topicData) {

                                    if(topicData.length > 0){

                                        console.log(topicData);

                                        var includedTopics = topicData[0]['subjectTopicIds'];

                                        /*remove topics*/
                                        managermodel.dbRemoveTopicsMultipleRows("subjecttopics", includedTopics)
                                        .then(function () {

                                            console.log('topics removed');

                                        })
                                        .catch(function(err){

                                            console.log('topics remove failed');
                                            console.log(err);
     
                                        });

                                        /*remove teacher-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("teachercourses", includedTopics)
                                        .then(function () {

                                            console.log('teacher-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('teacher-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("studentcourses", includedTopics)
                                        .then(function () {

                                            console.log('student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove parent-student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", includedTopics)
                                        .then(function () {

                                            console.log('parent-student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('parent-student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove helpakidstudy-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", includedTopics)
                                        .then(function () {

                                            console.log('helpakidstudy-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('helpakidstudy-courses remove failed');
                                            console.log(err);
     
                                        });


                                        callback(200, "Successfully Removed");/*response*/

                                    }  


                                })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Failed !");/*response*/

                                });


                            })
                            .catch(function(err){

                                console.log('group remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Group !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !"); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");/*response*/

        });
    }

});





/*check subject subgroup entries before remove subject subgroup */
router.post('/manager-check-subject-subgroup-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectSubgroupId == "") {

        callback(0, "Subject Subgroup Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    var subjectTable = "subjectsubgroups";

                    var subjectCondition = {"subjectSubgroupId":req.body.subjectSubgroupId};

                    sharemodel.dbgetdetails(["subjectSubgroupName"], subjectTable, subjectCondition) /*check group exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){
 
                            var promises = []; /*array for handling multiple query results*/

                            promises[0] = sharemodel.dbgetdetails("subjectClassId", "subjectclasses", subjectCondition);

                            promises[1] = sharemodel.dbgetdetails("subjectTopicId", "subjecttopics", subjectCondition);

                            promises[2] = managermodel.dbGetCommaSeparatedTopics(subjectCondition);

                            Promise.all(promises).then(function(data){

                                // console.log(data[0]);
                                // console.log(data[1]);
                                // console.log(data[2]);
  
                                if(data[0].length==0 && data[1].length==0){

                                    var dataExists =  {

                                        "classes":data[0].length,
                                        "topics":data[1].length

                                    };

                                    callback(200, "Proceed" , dataExists);


                                } else {

                                    var includedTopics = data[2][0]['subjectTopicIds'];

                                    var promises2 = []; /*array for handling multiple query results*/

                                    promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                                    promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                                    promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                                    Promise.all(promises2).then(function(data2){

                                        console.log(data2);

                                        var dataExists =  {

                                            "classes":data[0].length,
                                            "topics":data[1].length,
                                            "teachercourses" : data2[0][0].includedTeachers,
                                            "studentcourses" : data2[1][0].includedStudents,
                                            "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                        };


                                        callback(100, "Data Exists For This Subgroup" , dataExists);

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                        callback(0, "Failed !" , "");

                                    });

                                }

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                          
                        } else {

                            callback(0, "Invalid Subgroup !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});




/*remove subject subgroup*/
router.post('/manager-remove-subject-subgroup', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectSubgroupId == "") {

        callback(0, "Subject Subgroup Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var subjectTable = "subjectsubgroups";

                    var subjectCondition = {"subjectSubgroupId":req.body.subjectSubgroupId};

                    sharemodel.dbgetdetails(["subjectSubgroupName"], subjectTable, subjectCondition) /*check subgroup exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){

                            /*remove group*/
                            sharemodel.dbremove(subjectTable, subjectCondition) 
                            .then(function(){

 
                                /*remove classes under group*/
                                sharemodel.dbremove("subjectclasses", subjectCondition)
                                .then(function () {

                                    console.log('classes removed');

                                })
                                .catch(function(err){

                                    console.log('classes remove failed');
                                    console.log(err);

                                });

                                

                                /*get topics under subgroup*/
                                managermodel.dbGetCommaSeparatedTopics(subjectCondition) /*check topics under subgroup exists or not*/
                                .then(function (topicData) {

                                    if(topicData.length > 0){

                                        console.log(topicData);

                                        var includedTopics = topicData[0]['subjectTopicIds'];

                                        /*remove topics*/
                                        managermodel.dbRemoveTopicsMultipleRows("subjecttopics", includedTopics)
                                        .then(function () {

                                            console.log('topics removed');

                                        })
                                        .catch(function(err){

                                            console.log('topics remove failed');
                                            console.log(err);
     
                                        });

                                        /*remove teacher-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("teachercourses", includedTopics)
                                        .then(function () {

                                            console.log('teacher-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('teacher-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("studentcourses", includedTopics)
                                        .then(function () {

                                            console.log('student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove parent-student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", includedTopics)
                                        .then(function () {

                                            console.log('parent-student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('parent-student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove helpakidstudy-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", includedTopics)
                                        .then(function () {

                                            console.log('helpakidstudy-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('helpakidstudy-courses remove failed');
                                            console.log(err);
     
                                        });


                                        callback(200, "Successfully Removed");/*response*/

                                    }  


                                })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Failed !");/*response*/

                                });


                            })
                            .catch(function(err){

                                console.log('subgroup remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Subgroup !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !"); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");/*response*/

        });
    }

});






/*check subject class entries before remove subject class */
router.post('/manager-check-subject-class-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectClassId == "") {

        callback(0, "Subject Class Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/


                    var subjectTable = "subjectclasses";

                    var subjectCondition = {"subjectClassId":req.body.subjectClassId};

                    sharemodel.dbgetdetails(["subjectClassName"], subjectTable, subjectCondition) /*check class exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){
 
                            var promises = []; /*array for handling multiple query results*/

                            promises[0] = sharemodel.dbgetdetails("subjectTopicId", "subjecttopics", subjectCondition);

                            promises[1] = managermodel.dbGetCommaSeparatedTopics(subjectCondition);

                            Promise.all(promises).then(function(data){

                                // console.log(data[0]);
                                // console.log(data[1]);
   
                                if(data[0].length==0){

                                    var dataExists =  {

                                         "topics":data[0].length

                                    };

                                    callback(200, "Proceed" , dataExists);


                                } else {

                                    var includedTopics = data[1][0]['subjectTopicIds'];

                                    var promises2 = []; /*array for handling multiple query results*/

                                    promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                                    promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                                    promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                                    Promise.all(promises2).then(function(data2){

                                        console.log(data2);

                                        var dataExists =  {

                                            "topics":data[0].length,
                                            "teachercourses" : data2[0][0].includedTeachers,
                                            "studentcourses" : data2[1][0].includedStudents,
                                            "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                        };


                                        callback(100, "Data Exists For This Class" , dataExists);

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                        callback(0, "Failed !" , "");

                                    });

                                }

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                          
                        } else {

                            callback(0, "Invalid Class !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});






/*remove subject class*/
router.post('/manager-remove-subject-class', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectClassId == "") {

        callback(0, "Subject Class Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var subjectTable = "subjectclasses";

                    var subjectCondition = {"subjectClassId":req.body.subjectClassId};

                    sharemodel.dbgetdetails(["subjectClassName"], subjectTable, subjectCondition) /*check subgroup exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){

                            /*remove class*/
                            sharemodel.dbremove(subjectTable, subjectCondition) 
                            .then(function(){
                                
                                /*get topics under class*/
                                managermodel.dbGetCommaSeparatedTopics(subjectCondition) /*check topics under class exists or not*/
                                .then(function (topicData) {

                                    if(topicData.length > 0){

                                        console.log(topicData);

                                        var includedTopics = topicData[0]['subjectTopicIds'];

                                        /*remove topics*/
                                        managermodel.dbRemoveTopicsMultipleRows("subjecttopics", includedTopics)
                                        .then(function () {

                                            console.log('topics removed');

                                        })
                                        .catch(function(err){

                                            console.log('topics remove failed');
                                            console.log(err);
     
                                        });

                                        /*remove teacher-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("teachercourses", includedTopics)
                                        .then(function () {

                                            console.log('teacher-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('teacher-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("studentcourses", includedTopics)
                                        .then(function () {

                                            console.log('student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove parent-student-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", includedTopics)
                                        .then(function () {

                                            console.log('parent-student-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('parent-student-courses remove failed');
                                            console.log(err);
     
                                        });


                                        /*remove helpakidstudy-courses*/
                                        managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", includedTopics)
                                        .then(function () {

                                            console.log('helpakidstudy-courses removed');

                                        })
                                        .catch(function(err){

                                            console.log('helpakidstudy-courses remove failed');
                                            console.log(err);
     
                                        });


                                        callback(200, "Successfully Removed");/*response*/

                                    }  


                                })
                                .catch(function(err){

                                    console.log(err);
                                    callback(0, "Failed !");/*response*/

                                });


                            })
                            .catch(function(err){

                                console.log('class remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Class !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !"); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");/*response*/

        });
    }

});






/*check subject topic entries before remove subject topic */
router.post('/manager-check-subject-topic-entries', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message, "dataExists": details });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectTopicId == "") {

        callback(0, "Subject Topic Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var subjectTable = "subjecttopics";

                    var subjectCondition = {"subjectTopicId":req.body.subjectTopicId};

                    sharemodel.dbgetdetails(["subjectTopicName"], subjectTable, subjectCondition) /*check topic exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){
 

                            var includedTopics = req.body.subjectTopicId;

                            var promises2 = []; /*array for handling multiple query results*/

                            promises2[0] = managermodel.dbGetTopicsTeacherMultipleRows("teachercourses", includedTopics);

                            promises2[1] = managermodel.dbGetTopicsStudentMultipleRows("studentcourses", includedTopics);

                            promises2[2] = managermodel.dbGetTopicsHelpAKidMultipleRows("helpakidstudycourses", includedTopics);

                            Promise.all(promises2).then(function(data2){

                                console.log(data2);

                                if(data2[0][0].includedTeachers==0 && data2[1][0].includedStudents==0 && data2[2][0].includedHelpAKid==0 ){

                                     var dataExists =  {

                                        "teachercourses" : data2[0][0].includedTeachers,
                                        "studentcourses" : data2[1][0].includedStudents,
                                        "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                    };


                                    callback(200, "Proceed" , dataExists);

                                } else {

                                    var dataExists =  {

                                        "teachercourses" : data2[0][0].includedTeachers,
                                        "studentcourses" : data2[1][0].includedStudents,
                                        "helpakidstudycourses" : data2[2][0].includedHelpAKid

                                    };


                                    callback(100, "Data Exists For This Topic" , dataExists);

                                }

                                

                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Failed !" , "");

                            });

                            
                          
                        } else {

                            callback(0, "Invalid Subject Topic !", ""); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !", ""); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !", ""); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !", "");/*response*/

        });
    }

});





/*remove subject topic*/
router.post('/manager-remove-subject-topic', function (req, res) {

    const callback = (status, message, details) => {

        res.json({ "status": status, "message": message });
    }

    if(req.body.managerUniqueUserId == "") {

        callback(0, "Manager User Id Should Not Be Empty !");

    } else if (req.body.subjectTopicId == "") {

        callback(0, "Subject Topic Id Should Not Be Empty !");

    }

    else {

        sharemodel.dbGetUserIdfromUuid(req.body.managerUniqueUserId)
        .then(function (data) {

            var dt = datetime.create();

            var dateymd = dt.format('Y-m-d H:M:S');

            if (data.length > 0) {

                var managerUserId = data[0].userId;

                var managerUserRole = data[0].userRole;

                if(managerUserRole==2){ /*if manager*/

                    var subjectTable = "subjecttopics";

                    var subjectCondition = {"subjectTopicId":req.body.subjectTopicId};

                    sharemodel.dbgetdetails(["subjectTopicName"], subjectTable, subjectCondition) /*check topic exists or not*/
                    .then(function (subjectData) {

                        if(subjectData.length > 0){

                            /*remove topic*/
                            sharemodel.dbremove(subjectTable, subjectCondition) 
                            .then(function(){

                                var includedTopics = req.body.subjectTopicId;

                                /*remove teacher-courses*/
                                managermodel.dbRemoveTopicsMultipleRows("teachercourses", includedTopics)
                                .then(function () {

                                    console.log('teacher-courses removed');

                                })
                                .catch(function(err){

                                    console.log('teacher-courses remove failed');
                                    console.log(err);

                                });


                                /*remove student-courses*/
                                managermodel.dbRemoveTopicsMultipleRows("studentcourses", includedTopics)
                                .then(function () {

                                    console.log('student-courses removed');

                                })
                                .catch(function(err){

                                    console.log('student-courses remove failed');
                                    console.log(err);

                                });


                                /*remove parent-student-courses*/
                                managermodel.dbRemoveTopicsMultipleRows("parentstudentcourses", includedTopics)
                                .then(function () {

                                    console.log('parent-student-courses removed');

                                })
                                .catch(function(err){

                                    console.log('parent-student-courses remove failed');
                                    console.log(err);

                                });


                                /*remove helpakidstudy-courses*/
                                managermodel.dbRemoveTopicsMultipleRows("helpakidstudycourses", includedTopics)
                                .then(function () {

                                    console.log('helpakidstudy-courses removed');

                                })
                                .catch(function(err){

                                    console.log('helpakidstudy-courses remove failed');
                                    console.log(err);

                                });


                                callback(200, "Successfully Removed");/*response*/

                          

                            })
                            .catch(function(err){

                                console.log('topic remove failed');
                                console.log(err);

                            });


                            

                        } else {

                            callback(0, "Invalid Topic !"); /*response*/

                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !");/*response*/

                    });


                } else {

                    callback(0, "Invalid Manager Role Entry !"); /*response*/

                }

            } else {

                callback(0, "Invalid Manager User !"); /*response*/

            }


        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");/*response*/

        });
    }

});







module.exports = router;
