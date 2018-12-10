/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../config/db");
var studentmodel = require("../models/studentmodule");
var sharedmodel = require("../models/shared/shared");
var datetime = require("node-datetime");
var randomize = require("randomatic");
var shared = require('../controllers/shared/shared');





/*student profile details*/
router.post('/studentprofiledetails',function(req, res){

    const callback = function(status, message, profileDetails, studentCourses, profileStrength, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "studentCourses":studentCourses, "profileStrength": profileStrength});
    }

     if(req.body.uniqueUserId == ""){

        callback(0,"User Id Should Not Be Empty !", "", "", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var studentUserId = data[0].userId;

                    var promises = [];

                    promises[0] = studentmodel.getStudentProfileDetails(studentUserId);

                    promises[1] = studentmodel.getStudentCourses(studentUserId);

                    Promise.all(promises).then(function(studentData){

                        console.log(studentData);

                        var studentProfile = studentData[0][0];

                        var studentCourses = studentData[1];

                        /*calculate profile strength - start*/
                        var profileStrength = 40;

                        if(studentProfile['emailVerified']==1) {

                            profileStrength += 5;
                        }

                        if(studentProfile['profilePic']!="") {

                            profileStrength += 5;
                        }

                        if(studentProfile['Pincode']!="") {

                            profileStrength += 5;
                        }

                        if(studentProfile['parentFname']!="") {

                            profileStrength += 5;
                        }


                        if(studentProfile['parentLname']!="") {

                            profileStrength += 5;
                        }

                         if(studentProfile['parentEmail']!="") {

                            profileStrength += 5;
                        }

                         if(studentProfile['parentPhone']!="") {

                            profileStrength += 5;
                        }

                        if(studentCourses.length>0) {

                            profileStrength += 5;
                        }
                        /*calculate profile strength - end*/
 
                        callback(200, "Success", studentProfile, studentCourses, profileStrength); 

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "", "", "");

                    });

                } else {

                    callback(0, "Invalid User !", "", "", "", 401); /*response with 401 header status*/

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed To Get Details !", "", "", "");

            });
     }

});






/*student profile strength*/
router.post('/studentprofilestrength',function(req, res){

    const callback = function(status, message, profileStrength){

        res.json({"status":status, "message":message, "profileStrength": profileStrength});
    }

     if(req.body.uniqueUserId == ""){

        callback(0,"User Id Should Not Be Empty !", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var studentUserId = data[0].userId;

                    var promises = [];

                    promises[0] = studentmodel.getStudentProfileDetails(studentUserId);

                    promises[1] = studentmodel.getStudentCourses(studentUserId);

                    Promise.all(promises).then(function(studentData){

                        var studentProfile = studentData[0][0];

                        var studentCourses = studentData[1];

                        /*calculate profile strength - start*/
                        var profileStrength = 40;

                        if(studentProfile['emailVerified']==1) {

                            profileStrength += 5;
                        }

                        if(studentProfile['profilePic']!="") {

                            profileStrength += 5;
                        }

                        if(studentProfile['Pincode']!="") {

                            profileStrength += 5;
                        }

                        if(studentProfile['parentFname']!="") {

                            profileStrength += 5;
                        }


                        if(studentProfile['parentLname']!="") {

                            profileStrength += 5;
                        }

                         if(studentProfile['parentEmail']!="") {

                            profileStrength += 5;
                        }

                         if(studentProfile['parentPhone']!="") {

                            profileStrength += 5;
                        }

                        if(studentCourses.length>0) {

                            profileStrength += 5;
                        }
                        /*calculate profile strength - end*/
 
                        callback(200, "Success", profileStrength); 

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "");

                    });

                } else {

                    callback(0,"Invalid User !", "");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Get Details !", "");

            });
     }

});




/*student profile : parent details update*/
router.post('/studentprofileparentupdate', function(req, res){

	const callback = function(status, message){

		res.json({"status": status, "message": message});

	}

	if(req.body.uniqueUserId=="") {

		  callback(0, "User Id Should Not Be Empty !");

	} else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var studentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    /* insert student profile */

                	var updateData = {
                        "parentFname": req.body.parentFname,
                        "parentLname": req.body.parentLname,
                        "parentPhone": req.body.parentPhone,
                        "parentEmail": req.body.parentEmail,
                        "updatedOn":dateymd
                    };

                    var updateTable = "studentprofile";

                    var studentCondition = { "userId": studentUserId };
                   
                    sharedmodel.dbupdate(updateTable, updateData, studentCondition)

                        .then(function () {

                            callback(200, "Successfully Updated Profile Details");

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Update Profile !");

                        });
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Update Profile !");

            });
    }

});



/*student profile : snooze details update*/
router.post('/studentprofilesnoozealertupdate', function(req, res){

	const callback = function(status, message, snoozedDateTime, snoozeEndDate){

		res.json({"status": status, "message": message, "snoozedDateTime":snoozedDateTime, "snoozeEndDate":snoozeEndDate});

	}

	if(req.body.uniqueUserId=="") {

		  callback(0, "User Id Should Not Be Empty !");

	} else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var studentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    /* update student profile */

                    var dateymd = "";
	                var snoozeEndDate = "";


                	 if (req.body.snoozeDays !== "") {/* if snooze value exists - update profile*/

                        var snoozeDays = req.body.snoozeDays;

                        var snoozedt = datetime.create();

                        snoozedt.offsetInDays(snoozeDays);/*snooze end-date - add days to current date*/

                        var snoozeEndDate = snoozedt.format('Y-m-d H:M:S');

                        var updateData = {
	                        "snoozeAlertStatus": req.body.snoozeAlertStatus,
	                        "snoozedDateTime": dateymd,
	                        "snoozeEndDate": snoozeEndDate,
	                        "updatedOn":dateymd
	                    };

                    }  

                    var updateTable = "studentprofile";

                    var studentCondition = { "userId": studentUserId };
                   
                    sharedmodel.dbupdate(updateTable, updateData, studentCondition)

                        .then(function () {

                            callback(200, "Successfully Updated Snooze Details", dateymd, snoozeEndDate );

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Update Snooze !");

                        });
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Update Profile !");

            });
    }


});



/*student profile update : subjects*/
router.post('/studentprofilesubjectupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    /*student subject*/
    var studentSubjects = req.body.subjectTopicIds;

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var studentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var i = 1;/*count*/

                    /* remove subjects if exists ,before add new*/
                    var remove_Table = "studentcourses";

                    var remove_Condition = { "studentUserId": studentUserId };

                    sharedmodel.dbremove(remove_Table, remove_Condition)
                        .then(function () {

                            /*read array of subjects */
                            studentSubjects.forEach(function (item) {/*read array of student Subjects */

                                var courseTable = "studentcourses";/*subject table*/

                                var courseData = {

                                    "studentUserId": studentUserId,

                                    "subjectTopicId": item,

                                    "updatedOn": dateymd,

                                };


                                sharedmodel.dbinsert(courseTable, courseData) /*update subject to table*/

                                    .then(function (courseUpdatedResult) {

                                        console.log("Count: "+i+", "+"Array length: "+studentSubjects.length);

                                        if(i==studentSubjects.length){ /*last loop*/

                                             callback(200, "Subjects Updated Successfully");

                                        }

                                        i += 1;

                                    })
                                    .catch(function (err) {

                                        console.log(err);
                                        // callback(0,"Failed To Update !";

                                    });
                               
                            });

                        })
                        .catch(function (err) {
                            console.log(err);
                             callback(0,"Failed To Update !");

                        });
                     

                } else {

                    callback(0,"Invalid User !");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Update !");

            });

        }

    });

 


/*student profile registration : course details*/
router.post('/student-profile-registration-course-details',function(req, res){

    const callback = function(status, message, nickName, details){

        res.json({"status":status, "message":message, "nickName":nickName, "details":details});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var nickName = data[0].nickName;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');  

                    studentmodel.getStudentCourses(userId) /*Fetch studentCourses*/
                    .then(function (studentCourses) {

                        callback(200, "Success", nickName, studentCourses);

                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Failed to Get Details !", "");

                    });

                } else {

                    callback(0,"Invalid User !", "");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed to Get Details !", "");

            });
    }

});




/*student profile registration : parent details*/
router.post('/student-profile-registration-parent-details',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var nickName = data[0].nickName;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');  

                    var fields = ["parentFname", "parentLname", "parentPhone", "parentEmail"];

                    var table = "studentprofile";

                    var condition = { "userId":userId };

                    sharedmodel.dbgetdetails(fields, table, condition) /*Fetch parent details*/
                    .then(function (studentParent) {

                        var studentParentDetails ={

                            "nickName":nickName, 
                            "parentFname":studentParent[0].parentFname, 
                            "parentLname":studentParent[0].parentLname, 
                            "parentPhone":studentParent[0].parentPhone, 
                            "parentEmail":studentParent[0].parentEmail, 

                        };


                        callback(200, "Success", studentParentDetails);

                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Failed to Get Details !", "");

                    });

                } else {

                    callback(0,"Invalid User !", "");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed to Get Details !", "");

            });
    }

});




module.exports = router;