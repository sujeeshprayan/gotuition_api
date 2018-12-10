/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../config/db");
var teachermodel = require("../models/teachermodule");
var commonmodel =  require("../models/commonmodule");
var sharedmodel = require("../models/shared/shared");
var datetime = require("node-datetime");
var randomize = require("randomatic");
var shared = require('../controllers/shared/shared');
var path = require('path');
var _ = require('lodash');
var mv = require('mv');
var fx = require('mkdir-recursive');
var mkdirp = require('mkdirp');
var uniqid = require('uniqid');
var fs = require('fs');


var app = express();
var bodyParser = require('body-parser');
var formidable = require('formidable');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));







/*teacher profile registration : step3 details*/
router.post('/teacher-profile-registration-step3-details',function(req, res){

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

                    var fileds = ["tuitionCenterName", "newAdmissionStatus", "tuitionAt", "proffessionalTeachingExp", "homeTuitionExp", "nonTeachingExp", "totalStudentsTaught"];

                    var table = "tuitioncenters";

                    var condition = { "teacherUserId": userId };

                    sharedmodel.dbgetdetails(fileds, table, condition)
                        .then(function (data) {


                        teachermodel.getTeacherTuitionCenterFacilities(userId)
                        .then(function (tuitioncenterfacilities) {

                                var teacherProfileStep3 = {

                                   "nickName":nickName,
                                   "tuitionCenterName" : data[0].tuitionCenterName,
                                   "newAdmissionStatus" : data[0].newAdmissionStatus,
                                   "tuitionAt" : data[0].tuitionAt,
                                   "proffessionalTeachingExp" : data[0].proffessionalTeachingExp,
                                   "homeTuitionExp" : data[0].homeTuitionExp,
                                   "nonTeachingExp" : data[0].nonTeachingExp,
                                   "totalStudentsTaught" : data[0].totalStudentsTaught,
                                   "tuitioncenterfacilities" : tuitioncenterfacilities
                                   
                                };

                                callback(200, "Success", teacherProfileStep3);

                            })
                            .catch(function (error) {

                                console.log(error);
                                callback(0, "Failed to Get Details !", "");

                            });
 
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




/*teacher profile registration : step4 details*/
router.post('/teacher-profile-registration-step4-details',function(req, res){

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

                    var fileds = ["topDegree", "otherDegree", "Certifications", "Highlights"];

                    var table = "teachersqualifications";

                    var condition = { "teacherUserId": userId };

                    sharedmodel.dbgetdetails(fileds, table, condition)
                    .then(function (data) {

                            var teacherQualifications = {

                               "nickName":nickName,
                               "topDegree" : data[0].topDegree,
                               "otherDegree" : data[0].otherDegree,
                               "Certifications" : data[0].Certifications,
                               "Highlights" : data[0].Highlights
                               
                            };


                        callback(200, "Success", teacherQualifications);

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



/*teacher profile registration : course details*/
router.post('/teacher-profile-registration-course-details',function(req, res){

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

                    teachermodel.getTeacherCourses(userId) /*Fetch teacherCourses*/
                    .then(function (teacherCourses) {

                        callback(200, "Success", nickName, teacherCourses);

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





/*teacher profile registration : topdegrees details*/
router.post('/teacher-profile-registration-topdegrees-list',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    var table = "topDegrees";

    var fields = ["topDegreeName"];

    var condition = {"Status":"active"};

    sharedmodel.dbgetdetails(fields, table, condition) /*Fetch topdegress*/
    .then(function (topdegrees) {

        callback(200, "Success", topdegrees);

    })
    .catch(function (error) {

        console.log(error);
        callback(0, "Failed to Get Details !", "");

    });


});


 



/*tuition centers facilities listing*/
router.post('/tuitioncenterfacilities', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    if (req.body.facilityreq === "015") {

        teachermodel.gettuitioncenterfacilities(req.body, callback);

    } else {

        callback(0, "Invalid Request !", "");

    }
});


/*insert tuition center*/
router.post('/inserttuitioncenter', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    if (req.body.teacherUserId === "") {
        callback(0, "Teacher User Id Should Not Be Empty !", "");
    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
            .then(function (data) {
                if (data.length > 0) {
                    var teacherUserId = data[0].userId;
                    var dt = datetime.create();
                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "tuitioncenters";/*insert table*/
                    var insertData = {
                        "tuitionCenterName": req.body.tuitionCenterName,
                        "newAdmissionStatus": req.body.newAdmissionStatus,
                       // "freeTuitionWillingness": req.body.freeTuitionWillingness,
                        "tuitionAt": req.body.tuitionAt,
                        "proffessionalTeachingExp": req.body.proffessionalTeachingExp,
                        "homeTuitionExp": req.body.homeTuitionExp,
                        "nonTeachingExp": req.body.nonTeachingExp,
                        "totalStudentsTaught": req.body.totalStudentsTaught,
                        "updatedOn": dateymd
                    };

                    var tuitionCondition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, insertData, tuitionCondition)/*insert tuition center into table*/
                        .then(function (tuitionInsertedResult) {
                            console.log(tuitionInsertedResult);


                            /*insert teacher subject*/
                            var teacherSubjects = req.body.subjectTopicIds;

                            if (teacherSubjects.length > 0) {/*if teacherSubjects array not empty */

                                var i = 0;
                                /* remove subjects if exists ,before add new*/
                                var remove_Table = "teachercourses";
                                var remove_Condition = { "teacherUserId": teacherUserId };
                                sharedmodel.dbremove(remove_Table, remove_Condition)
                                    .then(function () {

                                        /*read array of subjects */
                                        teacherSubjects.forEach(function (item) {/*read array of teacherSubjects */
                                            var courseTable = "teachercourses";/*subject table*/
                                            var courseData = {
                                                "teacherUserId": teacherUserId,
                                                "subjectTopicId": item
                                            };
                                            sharedmodel.dbinsert(courseTable, courseData) /*update subject to table*/
                                                .then(function (courseUpdatedResult) {
                                                    console.log(courseUpdatedResult);
                                                })
                                                .catch(function (err) {
                                                    console.log(err);
                                                });
                                            i += 1;
                                        });

                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    });
                            }



                            if (req.body.snoozeDays !== "") {/* if snooze value exists - update profile*/
                                var snoozeDays = req.body.snoozeDays;
                                var snoozedt = datetime.create();
                                snoozedt.offsetInDays(snoozeDays);/*snooze end-date - add days to current date*/
                                var snoozeEndDate = snoozedt.format('Y-m-d H:M:S');
                                var updateTable = "teacherprofile";
                                var updateData = {
                                    "snoozeAlertStatus": "Yes",
                                    "snoozedDateTime": dateymd,
                                    "snoozeEndDate": snoozeEndDate,
                                    "updatedOn": dateymd
                                };


                                var teacherCondition = { "userId": teacherUserId };

                                console.log(updateData);
                                sharedmodel.dbupdate(updateTable, updateData, teacherCondition)/*update teacher profile*/
                                    .then(function (teacherUpdatedResult) {
                                        console.log(teacherUpdatedResult);
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    });
                            }


                            /*update tuition center facilities*/
                            var k = 1;
                            var facilityIds = req.body.facilityIds;

                            if (facilityIds.length > 0) {/*if facility array not empty */

                                /*get tuition center details */
                                var fields = ['tuitionCenterId'];
                                var tuitionTable = "tuitioncenters";
                                var whereCondition = { "teacherUserId": teacherUserId };

                                sharedmodel.dbgetdetails(fields, tuitionTable, whereCondition)/*get tuition center details */
                                    .then(function (tuitionCenter) {

                                        var tuitionCenterId = tuitionCenter[0].tuitionCenterId;

                                        /* remove failities if exists before add new*/
                                        var removetable = "tuitioncenterhavingfacilities";
                                        var removeCondition = { "tuitionCenterId": tuitionCenterId };
                                        sharedmodel.dbremove(removetable, removeCondition)
                                            .then(function () {

                                                /*read array of facilities */
                                                facilityIds.forEach(function (item) {/*read array of facilities */
                                                    var facilityTable = "tuitioncenterhavingfacilities";/*facility table*/
                                                    var facilityData = {
                                                        "tuitionCenterId": tuitionCenterId,
                                                        "facilityId": item
                                                    };
                                                    sharedmodel.dbinsert(facilityTable, facilityData) /*update facilities to table*/
                                                        .then(function (facilityUpdatedResult) {
                                                            console.log(facilityUpdatedResult);
                                                        })
                                                        .catch(function (err) {
                                                            console.log(err);
                                                        });
                                                    k += 1;
                                                });

                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                            });
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                    });
                            }


                            callback(200, "Profile Updated", ""); /*response*/

                        })
                        .catch(function (err) {
                            console.log(err);
                            callback(0, "Failed to Create Profile", "");
                        });
                } else {
                    callback(0, "Invalid User !", "");
                }
            })
            .catch(function (err) {
                console.log(err);
                callback(0, "Failed to Insert Details !", "");
            });
    }
});


/*insert teacher qualification*/
router.post('/insertteacherqualification', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    if (req.body.uniqueUserId === "") {

        callback(0, "User Unique Id Should Not Be Empty !", "");

    } else {
        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    /* insert qualifications */
                    var table = "teachersqualifications";

                    var inserData = {
                        "teacherUserId": teacherUserId,
                        "topDegree": req.body.topDegree,
                        "otherDegree": req.body.otherDegree,
                        "Certifications": req.body.Certifications,
                        "Highlights": req.body.Highlights
                    };

                    sharedmodel.dbinsert(table, inserData)

                        .then(function () {

                            callback(200, "Successfully updated qualifications", "");

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed to update qualifications !", "");

                        });
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {

                console.log(err);
                callback(0, "Failed to update qualifications !", "");

            });
    }
});

/* upload video to youtube */
router.post('/videouploadyoutube', function (req, res) {

    //console.log(req.body);

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(files);
        console.log(fields);
        console.log(err);
        var videoname = files.video.name;
        var videopath = files.video.path + '/';

        shared.youtubevideoupload(videoname, videopath);
    });

});


/*teacher profile details*/
router.post('/teacherprofiledetails',function(req, res){

    const callback = function(status, message, profileDetails, tuitionCenterFacilities, teacherCourses, profileStrength, headerStatus){


        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "tuitionCenterFacilities":tuitionCenterFacilities, "teacherCourses":teacherCourses, "profileStrength": profileStrength});
    }

     if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "", "", "", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var promises = [];

                    promises[0] = teachermodel.getTeacherProfileDetails(teacherUserId);

                    promises[1] = teachermodel.getTeacherTuitionCenterFacilities(teacherUserId);

                    promises[2] = teachermodel.getTeacherCourses(teacherUserId);

                    Promise.all(promises).then(function(teacherData){

                        console.log(teacherData);

                        var teacherProfile = teacherData[0][0];

                        var tuitionCenterFacility = teacherData[1]; 

                        var teacherCourses = teacherData[2];

                        /*calculate profile strength - start*/
                        var profileStrength = 20;

                        if(teacherProfile['emailVerified']==1) {

                            profileStrength += 5;
                        }

                        if(teacherProfile['profilePic']!="") {

                            profileStrength += 2;
                        }

                        if(teacherProfile['Pincode']!="") {

                            profileStrength += 3;
                        }

                        if(teacherProfile['aadhaarNumber']!="") {

                            profileStrength += 5;
                        }

                         if(teacherProfile['customText']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['otherCredentials']!="") {

                            profileStrength += 4;
                        }

                         if(teacherProfile['tuitionCenterName']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['proffessionalTeachingExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['homeTuitionExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['nonTeachingExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['totalStudentsTaught']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['topDegree']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['otherDegree']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['Certifications']!="") {

                            profileStrength += 2;
                        }

                        if(teacherProfile['Highlights']!="") {

                            profileStrength += 3;
                        }


                        if(tuitionCenterFacility.length>0) {

                            profileStrength += 5;
                        }

                        if(teacherCourses.length>0) {

                            profileStrength += 5;
                        }
                        /*calculate profile strength - end*/
 
                        callback(200, "Success", teacherProfile, tuitionCenterFacility, teacherCourses, profileStrength); 

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "", "", "", "");

                    });

                } else {

                    callback(0,"Invalid User !", "", "", "", "", 404);/*response with 404 header status*/

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Get Details !", "", "", "", "");

            });
     }

});




/*teacher profile strength*/
router.post('/teacherprofilestrength',function(req, res){

    const callback = function(status, message,  profileStrength){

        res.json({"status":status, "message":message, "profileStrength": profileStrength});
    }

     if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var promises = [];

                    promises[0] = teachermodel.getTeacherProfileDetails(teacherUserId);

                    promises[1] = teachermodel.getTeacherTuitionCenterFacilities(teacherUserId);

                    promises[2] = teachermodel.getTeacherCourses(teacherUserId);

                    Promise.all(promises).then(function(teacherData){

                        console.log(teacherData);

                        var teacherProfile = teacherData[0][0];

                        var tuitionCenterFacility = teacherData[1]; 

                        var teacherCourses = teacherData[2];

                        /*calculate profile strength - start*/
                        var profileStrength = 20;

                        if(teacherProfile['emailVerified']==1) {

                            profileStrength += 5;
                        }

                        if(teacherProfile['profilePic']!="") {

                            profileStrength += 2;
                        }

                        if(teacherProfile['Pincode']!="") {

                            profileStrength += 3;
                        }

                        if(teacherProfile['aadhaarNumber']!="") {

                            profileStrength += 5;
                        }

                         if(teacherProfile['customText']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['otherCredentials']!="") {

                            profileStrength += 4;
                        }

                         if(teacherProfile['tuitionCenterName']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['proffessionalTeachingExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['homeTuitionExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['nonTeachingExp']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['totalStudentsTaught']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['topDegree']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['otherDegree']!="") {

                            profileStrength += 5;
                        }

                        if(teacherProfile['Certifications']!="") {

                            profileStrength += 2;
                        }

                        if(teacherProfile['Highlights']!="") {

                            profileStrength += 3;
                        }


                        if(tuitionCenterFacility.length>0) {

                            profileStrength += 5;
                        }

                        if(teacherCourses.length>0) {

                            profileStrength += 5;
                        }
                        /*calculate profile strength - end*/
 
                        callback(200, "Success", profileStrength); 

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Strenth !", "");

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




/*teacher profile home*/
router.post('/teacherprofilehome',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "teacherDetails":details });
    }

     if(req.body.uniqueUserId == ""){

        callback(0,"User Id Should Not Be Empty !", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var userLongitude = data[0].Longitude;

                    var userLatitude = data[0].Latitude;

                    var promises = [];

                    promises[0] = teachermodel.getTeacherProfileDetails(teacherUserId);

                    promises[1] = teachermodel.getTeacherCourses(teacherUserId);

                    promises[2] = commonmodel.getNearbyTeachersDetails(userLongitude, userLatitude, teacherUserId);

                    promises[3] = commonmodel.getNearbyParentsDetails(userLongitude, userLatitude,'');

                    promises[4] = commonmodel.getNearbyStudentsDetails(userLongitude, userLatitude,'');

                    promises[5] = commonmodel.getUsersUnreadMessageDetails(teacherUserId);

                    promises[6] = commonmodel.getUsersUnreadChatMessageDetails(teacherUserId);
                    



                    Promise.all(promises).then(function(teacherData){

                        console.log(teacherData);

                        var teacherProfile = teacherData[0][0];

                        var teacherCourses = teacherData[1];

                        var nearbyTeachers = teacherData[2].length;

                        var nearbyParents = teacherData[3].length;

                        var nearbyStudents = teacherData[4].length;

                        var unreadMessages = teacherData[5].length;

                        var unreadChatMessages = teacherData[6].length;



                        var details ={

                            "uniqueUserId":teacherProfile.uniqueUserId,
                            "Fname":teacherProfile.Fname,
                            "Lname":teacherProfile.Lname,
                            "nickName":teacherProfile.nickName,
                            "Email":teacherProfile.Email,
                            "Gender":teacherProfile.Gender,
                            "ageGroup":teacherProfile.ageGroup, 
                            "Phone":teacherProfile.Phone,
                            "userRole":teacherProfile.userRole,
                            "profilePic":teacherProfile.profilePic,
                            "Latitude":teacherProfile.Latitude,
                            "Longitude":teacherProfile.Longitude,
                            "Pincode":teacherProfile.Pincode,
                            "Address":teacherProfile.Address,
                            "Locality":teacherProfile.Locality,
                            "District":teacherProfile.District,
                            "State":teacherProfile.State,
                            "Country":teacherProfile.Country,
                            "State":teacherProfile.State,
                            "customText":teacherProfile.customText,
                            "profileId":teacherProfile.profileId,
                            "tuitionCenterName":teacherProfile.tuitionCenterName,
                            "cardCustomTitle":teacherProfile.cardCustomTitle,
                            "cardCustomSubtitle":teacherProfile.cardCustomSubtitle,
                            "cardCustomSubject":teacherProfile.cardCustomSubject,
                            "adminRating":teacherProfile.adminRating,
                            "userRating":teacherProfile.userRating,
                            "teacherCourses" : teacherCourses,
                            "nearbyTeachersCount": nearbyTeachers,
                            "nearbyParentsCount": nearbyParents,
                            "nearbyStudentsCount": nearbyStudents,
                            "unreadMessagesCount": unreadMessages,
                            "unreadChatMessagesCount": unreadChatMessages

                        };


                        callback(200, "Success", details);  

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "", "");

                    });

                } else {

                    callback(0, "Invalid User !", "", "");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed To Get Details !",  "", "");

            });
     }

});





/*teacher profile update : Aadhaar Number*/
router.post('/teacherprofileaadhaarnumberupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.aadhaarNumber==""){

         callback(0,"Aadhaar Number Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "aadhaarNumber": req.body.aadhaarNumber,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Aadhaar Number Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Aadhaar Number !");

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





/*teacher profile update : about me*/
router.post('/teacherprofileaboutmeupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.aboutMe==""){

         callback(0,"About Me Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "customText": req.body.aboutMe,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "About Me Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update About Me !");

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





/*teacher profile update : new admission*/
router.post('/teacherprofilenewadmissionupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.newAdmissionStatus==""){

         callback(0,"New Admission Status Should Not Be Empty !");

    } 
    else if(req.body.newAdmissionStatus!="On" &&  req.body.newAdmissionStatus!="Off"){

         callback(0,"Invalid New Admission Status. Valid Only On or Off !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "tuitioncenters";

                    var updatedata = {
                        "newAdmissionStatus": req.body.newAdmissionStatus,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "New Admission Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update New Admission Status !");

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

 


/*teacher profile update : freetuition Willingness*/
router.post('/teacherprofilefreetuitionwillingnessupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.freeTuitionWillingness==""){

         callback(0,"Free Tuition Willingness Status Should Not Be Empty !");

    } 
    else if(req.body.freeTuitionWillingness!="Yes" &&  req.body.freeTuitionWillingness!="No"){

         callback(0,"Invalid Free Tuition Willingness Status. Valid Only Yes or No !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "tuitioncenters";

                    var updatedata = {
                        "freeTuitionWillingness": req.body.freeTuitionWillingness,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Freetuition Willingness Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Freetuition Willingness Status !");

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




/*teacher profile update : alert type*/
router.post('/teacherprofilealerttypeupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertType==""){

         callback(0,"Alert Type Should Not Be Empty !");

    } 
    else if(req.body.alertType!="Email" &&  req.body.alertType!="SMS" &&  req.body.alertType!="Both"){

         callback(0,"Invalid Alert Type. Valid Only Email, SMS or Both !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertType": req.body.alertType,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Type Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Type !");

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




/*teacher profile update : alertInterval*/
router.post('/teacherprofilealertintervalupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertInterval==""){

         callback(0,"Alert Interval Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertInterval": req.body.alertInterval,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": userId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Interval Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Interval !");

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





/*teacher profile update : alert Parent Student Respond Status*/
router.post('/teacheralertparentstudentrespondupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertParentStudentRespond==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.alertParentStudentRespond!="On" &&  req.body.alertParentStudentRespond!="Off" ){

         callback(0,"Invalid Status. Valid Only On or Off !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertParentStudentRespond": req.body.alertParentStudentRespond,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Status !");

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





/*teacher profile update : alert Student Join Interest Status*/
router.post('/teacheralertstudentjoinintereststatusupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertStudentJoinInterest==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.alertStudentJoinInterest!="On" &&  req.body.alertStudentJoinInterest!="Off" ){

         callback(0,"Invalid Status. Valid Only On or Off !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertStudentJoinInterest": req.body.alertStudentJoinInterest,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Status !");

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




/*teacher profile update : alert Kid Free Teach Request*/
router.post('/teacheralertkidfreeteacherequeststatusupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertKidFreeTeachRequest==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.alertKidFreeTeachRequest!="On" &&  req.body.alertKidFreeTeachRequest!="Off" ){

         callback(0,"Invalid Status. Valid Only On or Off !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertKidFreeTeachRequest": req.body.alertKidFreeTeachRequest,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Status !");

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



/*teacher profile update : alert Business Improve Notification*/
router.post('/teacheralertbusinessimprovenotificationstatusupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.alertBusinessImproveNotification==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.alertBusinessImproveNotification!="On" &&  req.body.alertBusinessImproveNotification!="Off" ){

         callback(0,"Invalid Status. Valid Only On or Off !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "alertBusinessImproveNotification": req.body.alertBusinessImproveNotification,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Alert Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Alert Status !");

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




/*teacher profile update : help a kid request status*/
router.post('/teacherhelpakidintereststatusupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.helpAKidInterest==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.helpAKidInterest!="Yes" &&  req.body.helpAKidInterest!="No" ){

         callback(0,"Invalid Status. Valid Only Yes or No !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "helpAKidInterest": req.body.helpAKidInterest,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Help A Kid Interest Status Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Help A Kid Interest Status !");

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




/*teacher profile update : alert snooze status*/
router.post('/teacheralertsnoozestatusupdate',function(req, res){

    const callback = function(status, message, snoozedDateTime, snoozeEndDate){

        res.json({"status":status, "message":message, "snoozedDateTime":snoozedDateTime, "snoozeEndDate":snoozeEndDate});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.snoozeAlertStatus==""){

         callback(0,"Status Should Not Be Empty !");

    } 
    else if(req.body.snoozeAlertStatus!="Yes" &&  req.body.snoozeAlertStatus!="No" ){

         callback(0,"Invalid Status. Valid Only Yes or No !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var snoozeDays = req.body.snoozeDays;

                    var snoozedt = datetime.create();

                    snoozedt.offsetInDays(snoozeDays);/*snooze end-date - add days to current date*/

                    var snoozeEndDate = snoozedt.format('Y-m-d H:M:S');

                    var updateTable = "teacherprofile";

                    var updateData = {
                        "snoozeAlertStatus": req.body.snoozeAlertStatus,
                        "snoozedDateTime": dateymd,
                        "snoozeEndDate": snoozeEndDate,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(updateTable, updateData, condition)
                        .then(function () {

                            callback(200, "Snooze Alert Status Updated Successfully",dateymd, snoozeEndDate);
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Snooze Alert Status !");

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


/*teacher profile update : tuitionAt*/
router.post('/teacherprofiletuitionatupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.tuitionAt==""){

         callback(0,"Tuition At Should Not Be Empty !");

    }  
    else if(req.body.tuitionAt!="My Home" &&  req.body.tuitionAt!="Student Home" && req.body.tuitionAt!="Center" &&  req.body.tuitionAt!="All"){

         callback(0,"Invalid Tuition At Value. Valid Only My Home, Student Home, Center or All !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "tuitioncenters";

                    var updatedata = {
                        "tuitionAt": req.body.tuitionAt,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Tuition At Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Tuition At !");

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





/*teacher profile update : tuitioncenter details*/
router.post('/teacherprofiletuitioncenterdetailsupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "tuitioncenters";

                    var updatedata = {
                        "tuitionCenterName": req.body.tuitionCenterName,
                        "proffessionalTeachingExp": req.body.proffessionalTeachingExp,
                        "homeTuitionExp": req.body.homeTuitionExp,
                        "nonTeachingExp": req.body.nonTeachingExp,
                        "totalStudentsTaught": req.body.totalStudentsTaught,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Tuition Center Details Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Tuition Center Details !");

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




/*teacher profile update : subjects*/
router.post('/teacherprofilesubjectupdate', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    /*teacher subject*/
    var teacherSubjects = req.body.subjectTopicIds;

    console.log(req.body.uniqueUserId);

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var i = 1;/*count*/

                    /* remove subjects if exists ,before add new*/
                    var remove_Table = "teachercourses";

                    var remove_Condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbremove(remove_Table, remove_Condition)
                        .then(function () {

                            /*read array of subjects */
                            teacherSubjects.forEach(function (item) {/*read array of teacherSubjects */

                                var courseTable = "teachercourses";/*subject table*/

                                var courseData = {

                                    "teacherUserId": teacherUserId,

                                    "subjectTopicId": item

                                };

                                sharedmodel.dbinsert(courseTable, courseData) /*update subject to table*/

                                    .then(function (courseUpdatedResult) {

                                        console.log("Count: "+i+", "+"Array length: "+teacherSubjects.length);

                                        if(i==teacherSubjects.length){ /*last loop*/

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








/*teacher profile update : teaching highlights*/
router.post('/teacherprofileteachinghighlightsupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.Highlights==""){

         callback(0,"Highlights Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teachersqualifications";

                    var updatedata = {
                        "Highlights": req.body.Highlights,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Teaching Highlights Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Highlights Details !");

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



/*teacher profile update : teaching highlights*/
router.post('/teacherprofilequalificationsupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teachersqualifications";

                    var updatedata = {
                        "topDegree": req.body.topDegree,
                        "otherDegree": req.body.otherDegree,
                        "Certifications": req.body.Certifications,
                        "updatedOn": dateymd
                    };

                    var condition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Qualifications Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Qualifications Details !");

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





/*teacher profile update : tuitioncenter facilities*/
router.post('/teachertuitioncenterfacilitiesupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    /*update tuition center facilities*/
    var k = 1;
    var facilityIds = req.body.facilityIds;

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else  if(facilityIds.length == 0){

         callback(0,"Tuition Center Facilities Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teachersqualifications";

                     /*get tuition center details */
                    var fields = ['tuitionCenterId'];

                    var tuitionTable = "tuitioncenters";

                    var whereCondition = { "teacherUserId": teacherUserId };

                    sharedmodel.dbgetdetails(fields, tuitionTable, whereCondition)/*get tuition center details */

                    .then(function (tuitionCenter) {

                        var tuitionCenterId = tuitionCenter[0].tuitionCenterId;

                        /* remove failities if exists before add new*/
                        var removetable = "tuitioncenterhavingfacilities";

                        var removeCondition = { "tuitionCenterId": tuitionCenterId };

                        sharedmodel.dbremove(removetable, removeCondition)
                        .then(function () {

                            /*read array of facilities */
                            facilityIds.forEach(function (item) {/*read array of facilities */

                                var facilityTable = "tuitioncenterhavingfacilities";/*facility table*/

                                var facilityData = {
                                    "tuitionCenterId": tuitionCenterId,
                                    "facilityId": item
                                };

                                sharedmodel.dbinsert(facilityTable, facilityData) /*update facilities to table*/
                                    .then(function (facilityUpdatedResult) {


                                        if(k==facilityIds.length)/*last loop*/
                                        {
                                            console.log(k);

                                            console.log(facilityIds.length);
                                            
                                            callback(200, "Tuition Center Facilities Updated Successfully");

                                        }

                                        k += 1;

                                    })
                                    .catch(function (err) {

                                        console.log(err);

                                    });

                            });

                        })
                        .catch(function (err) {

                            console.log(err);

                        });
                    })
                    .catch(function (err) {

                        console.log(err);

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





/*teacher profile update : other credentials*/
router.post('/teacherprofileothercredentialssupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.otherCredentials==""){

         callback(0,"Other Credentials Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "otherCredentials": req.body.otherCredentials,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Other Credentials Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Other Credentials !");

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




/*teacher rating update : by student or parent*/
router.post('/teacherratingreviewupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.teacherUniqueUserId==""){

         callback(0, "Teacher User Id Should Not Be Empty !");

    } else if(req.body.Rating==""){

         callback(0, "Rating Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId)
                    .then(function (teacherdata) {
                        
                        if (teacherdata.length > 0) {

                            var teacherUserId = teacherdata[0].userId;

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var table = "userteacherrating";

                            var insertData = {
                                "teacherUserId": teacherUserId,
                                "userId" : userId, 
                                "Rating" : req.body.Rating,
                                "Comments" : req.body.Comments,
                                "updatedOn": dateymd
                            };

                             /* remove reviews if exists ,before add new*/
                            var remove_Table = "userteacherrating";

                            var remove_Condition1 = { "teacherUserId": teacherUserId };

                            var remove_Condition2 = { "userId" : userId};

                            sharedmodel.dbremove2and(remove_Table, remove_Condition1, remove_Condition2)/*remove review*/
                                .then(function () {
 
                                    sharedmodel.dbinsert(table, insertData)/*insert new review*/
                                        .then(function () {

                                            callback(200, "Review Updated Successfully");
                 
                                        })
                                        .catch(function (error) {

                                            console.log(error);
                                            callback(0, "Failed to Update Your Review !");

                                        });

                                })
                                .catch(function (error) {

                                    console.log(error);
                                    callback(0, "Failed to Update Your Review !");

                                });

                        } else {

                            callback(0,"Invalid Teacher User !");
                        }

                    })
                    .catch(function(err){

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




/*teacher profile update : share card*/
router.post('/teacher-profile-share-card-update',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.cardCustomTitle==""){

         callback(0,"Custom Title Should Not Be Empty !");

    } 
    else if(req.body.cardCustomSubtitle==""){

         callback(0,"Custom Subtitle Should Not Be Empty !");

    } 
    else if(req.body.cardCustomSubject==""){

         callback(0,"Custom Subject Should Not Be Empty !");

    } 

    else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "teacherprofile";

                    var updatedata = {
                        "cardCustomTitle": req.body.cardCustomTitle,
                        "cardCustomSubtitle": req.body.cardCustomSubtitle,
                        "cardCustomSubject": req.body.cardCustomSubject,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Share Card Updated Successfully");
 
                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update !");

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







/*teacher contact Insert Or Update*/
router.post('/teacherparentstudentcontactinsertupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    var actionFlag = req.body.actionFlag;

    var actionFlagStatus = req.body.actionFlagStatus;

    if(req.body.uniqueUserId == ""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.teacherUniqueUserId == ""){

         callback(0, "Teacher User Id Should Not Be Empty !");

    } else if(req.body.actionUniqueUserId == ""){

         callback(0, "Action User Id Should Not Be Empty !");

    } else if(req.body.actionFlag == ""){ /* actionFlag ==> { 1=Viewed, 2=Contacted, 3=Shortlisted, 4=Admited, 5=Admission Revoked, 6=Moved To Old, 7=Removed }*/

         callback(0, "Action Flag Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*check user*/
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var uniqueUserId = data[0].uniqueUserId;

                    var userFname = data[0].Fname;

                    var userLname = data[0].Lname;

                    if(userLname==null) { 

                        var userFnameLname = userFname;

                    } else {

                        var userFnameLname = userFname+' '+userLname;

                    }

                    var userRole = data[0].userRole;

                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*check user*/
                    .then(function (teacherdata) {
                        
                        if (teacherdata.length > 0) {

                            var teacherUserId = teacherdata[0].userId;

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var actionUniqueUserId = req.body.actionUniqueUserId;

                            if(actionUniqueUserId == req.body.teacherUniqueUserId){ /*if action user is teachcer */

                                var actionUserId = teacherUserId;

                            } else { /*if action user is student or parent*/

                                var actionUserId = userId;

                            }

                            var fields = "ContactId";

                            var table = "teacherstudentparentcontacts";

                            var condition1 = { "teacherUserId":teacherUserId };

                            var condition2 = { "contactUserId":userId };

                            sharedmodel.dbgetdetails2and(fields, table, condition1, condition2)
                            .then(function (userContactData) {

                                console.log(userContactData);

                                /* Action Flags = {1=Viewed, 2=Contacted, 3=Shortlisted, 4=Admited, 5=Admission Revoked, 6=Moved To Old, 7=Removed } */

                                /*contact log details*/
                                if(userRole == 5) { /*parent*/

                                    var userprofilelink = "user/parent/details/"+uniqueUserId;

                                } else if(userRole == 6) { /*student*/

                                    var userprofilelink = "user/student/details/"+uniqueUserId;

                                }
                                /*end - contact log details*/

                                /*start - actionFlag check*/
                                if(actionFlag == 1) { /*viewed*/

                                     var contactData = {
                                        "teacherAction" : actionFlag, /*viewed status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Visited";

                                    var logAction = 'You Have Visited <a href='+userprofilelink+'>'+userFnameLname+'</a>`s profile'; /*logAction Message*/

                                } else if(actionFlag == 2) { /*Contacted*/

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Contacted status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Added To Contact";

                                    var logAction = 'You Have Contacted <a href='+userprofilelink+'>'+userFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 3) { /*shortlisted*/

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Shortlisted status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Shortlisted";

                                    var logAction = 'You Have Shortlisted <a href='+userprofilelink+'>'+userFnameLname+'</a>'; /*logAction Message*/

                                
                                } else if(actionFlag == 4) { /*Admited*/

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Admited status*/
                                        "contactUserAction":8,/*TeacherAdmited Status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Admited";

                                    var logAction = 'You Have Admited <a href='+userprofilelink+'>'+userFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 5) { /*Admission Revoked*/

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Admission Revoked status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Admission Revoked";

                                    var logAction = 'You Have Revoked Admission Of <a href='+userprofilelink+'>'+userFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 6) { /*Moved To Old*/

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Moved To Old Status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Moved To Old";

                                    var logAction = 'You Have Moved <a href='+userprofilelink+'>'+userFnameLname+'</a> To Old Students'; /*logAction Message*/


                                } else if(actionFlag == 7) { /*Removed */

                                    var contactData = {
                                        "teacherAction" : actionFlag, /*Removed Status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Removed";

                                    var logAction = 'You Have Removed <a href='+userprofilelink+'>'+userFnameLname+'</a>'; /*logAction Message*/


                                }  /*end -actionFlag check*/


                                /*contact log table details*/
                                var logTable="contactlogs"; 

                                var logData={
                                    "teacherUserId":teacherUserId,
                                    "contactUserId":userId,
                                    "actionUserId" : actionUserId,
                                    "Action" : logAction
                                };
                                /*end contact log table details*/


                                if(userContactData.length > 0) { /*if same entry already exists*/
 
                                    var updateCondition = { "ContactId":userContactData[0].ContactId };

                                    sharedmodel.dbupdate(table, contactData, updateCondition) /*contact update*/
                                        .then(function () {

                                            /*contact logs creation*/
                                            sharedmodel.dbinsert(logTable, logData); /*contact log insertion*/

                                            /*response*/
                                            callback(200, messageHint+" Successfully");
                 
                                        })
                                        .catch(function (error) {

                                            console.log(error);
                                            callback(0, "Failed to Update !");

                                        });


                                } else { /*if same entry not already exists - insert*/


                                     var contactData = {

                                        "teacherUserId": teacherUserId,
                                        "contactUserId" : userId, 
                                        "teacherAction" : actionFlag, /*may be viewed as first action*/
                                        "updatedOn": dateymd

                                    };


                                    sharedmodel.dbinsert(table, contactData) /*contact insert*/
                                        .then(function () {

                                            /*contact logs creation*/
                                            sharedmodel.dbinsert(logTable, logData); /*contact log insertion*/


                                            /*response*/
                                            callback(200, "Visited Successfully");
                 
                                        })
                                        .catch(function (error) {

                                            console.log(error);
                                            callback(0, "Failed to Update !");

                                        });

                                }
                                
                            })
                            .catch(function(err){

                                  console.log(err);

                                 callback(0,"Failed To Update !");

                            });

                           
                        } else {

                            callback(0,"Invalid Teacher User !");
                        }

                    })
                    .catch(function(err){

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

 


/*teacher : My Contacts Dashboard Overview */
router.post('/teachermycontactsoverview', function(req, res){

    const callback = function(status, message, overview){

        res.json({"status":status, "message":message, "overview":overview});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                var promises = [];

                promises[0] = teachermodel.getTeacherViewedStudents(teacherUserId);

                promises[1] = teachermodel.getTeacherContactedStudents(teacherUserId);

                promises[2] = teachermodel.getTeacherShortlistedStudents(teacherUserId);

                promises[3] = teachermodel.getTeacherAdmissionRequestedStudents(teacherUserId);

                promises[4] = teachermodel.getTeacherAdmitedStudents(teacherUserId);

                promises[5] = teachermodel.getTeacherOldStudents(teacherUserId);

                Promise.all(promises).then(function(overviewData){


                    console.log(overviewData);

                    var overview = {

                        "viewedStudents" : overviewData[0].length,

                        "contactedStudents" : overviewData[1].length,

                        "shortlistedStudents" : overviewData[2].length,

                        "admissionRequestedStudents" : overviewData[3].length,

                        "admitedStudents" : overviewData[4].length,

                        "oldStudents" : overviewData[5].length


                    };

                     callback(200, "Success", overview);/*response*/

                })
                .catch(function(err){

                    console.log(err);

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});




/*Teacher : My Contacts : Viewed Students or Parents List by Subjects*/
router.post('/teachermycontactsviewedstudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactViewed(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});




/*Teacher : My Contacts : Contacted Students or Parents List by Subjects*/
router.post('/teachermycontactscontactedstudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactContacted(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});





/*Teacher : My Contacts : Shortlisted Students or Parents List by Subjects*/
router.post('/teachermycontactsshortlistedstudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactshortlisted(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});





/*Teacher : My Contacts : admission Requested Students or Parents List by Subjects*/
router.post('/teachermycontactsadmissionrequestedstudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactadmissionRequested(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});




/*Teacher : My Contacts : Admited Students or Parents List by Subjects*/
router.post('/teachermycontactsadmitedStudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactAdmited(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});



/*Teacher : My Contacts : Old Students or Parents List by Subjects*/
router.post('/teachermycontactsoldstudentslist', function(req, res){

    const callback = function(status, message, courseStudentsData){

        res.json({"status":status, "message":message, "courseStudentsData":courseStudentsData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseStudentsData){

                    console.log(courseStudentsData);


                    if(courseStudentsData.length > 0){

                        var c = 1;

                        courseStudentsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseStudentsInContactOld(teacherUserId, subjectTopicId) /*Fetch Course-Students In Contact*/
                            .then(function (CourseStudentsInContact) {

                                item.CourseStudentsInContact = CourseStudentsInContact; /*CourseStudentsInContact to courseStudentsData index*/

                                /*check for last loop to send final response*/
                                if (c == courseStudentsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseStudentsData);/*response*/

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

                     callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});







/*teacher : remove contact from list*/
router.post('/teacherremovecontactfromlist', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.ContactId == "") {

         callback(0, "Contact Id Should Not Be Empty !");

    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var userId = data[0].userId;

                /*remove contact*/
                var remove_Table = "teacherstudentparentcontacts";
                var remove_Condition = { "ContactId": req.body.ContactId };
                sharedmodel.dbremove(remove_Table, remove_Condition)
                .then(function () {

                     callback(200, "Removed Successfully");/*response*/

                })
                .catch(function(err){

                    console.log(err);

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Remove !");

        });
    }

});



/*Teacher : Help A Kid Study List By Subjects*/
router.post('/teacherhelpakidstudylistbysubjects', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getTeacherCourses(teacherUserId) /*get teacher courses*/
                .then(function(courseHelpKidsData){

                    console.log(courseHelpKidsData);


                    if(courseHelpKidsData.length > 0){

                        var c = 1;

                        courseHelpKidsData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            teachermodel.getTeacherCourseHelpAKIdsStudy(teacherUserId, subjectTopicId) /*Fetch Course-HelpKids*/
                            .then(function (CourseHelpKidsStudy) {

                                item.CourseHelpKidsStudy = CourseHelpKidsStudy; /*CourseHelpKidStudy to CourseHelpKidStudy index*/

                                /*check for last loop to send final response*/
                                if (c == courseHelpKidsData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseHelpKidsData);/*response*/

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
                    callback(0, "Failed To Get Details !");/*response*/

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0,"Failed To Get Details !");

        });
    }

});



/*Teacher : Help A Kid Study Details*/
router.post('/teacherhelpakidstudydetails', function(req, res){

    const callback = function(status, message, details, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "details":details});

    }


    var helpAKidId = req.body.helpAKidId;

    if(req.body.uniqueUserId == "") {

        callback(0, "User Id Should Not Be Empty !", "");

    } else if(req.body.helpAKidId == "") {

        callback(0, "Kid Id Should Not Be Empty !", "");

    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                teachermodel.getHelpAKidStudyDetails(helpAKidId, teacherUserId) /*get HelpAKidStudy Details*/
                .then(function(kidStudyData){

                    console.log(kidStudyData);

                    if(kidStudyData.length > 0){

                        var c = 1;

                        kidStudyData.forEach(function (item, index, array) { /*loop*/


                            teachermodel.getHelpAKidStudyCoursesDetails(helpAKidId) /*Fetch HelpAKidStudy Courses Details*/
                            .then(function (KidStudyCoursesDetails) {

                                item.KidStudyCoursesDetails = KidStudyCoursesDetails; /*CourseHelpKidStudy to CourseHelpKidStudy index*/

                                /*check for last loop to send final response*/
                                if (c == kidStudyData.length) { 

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

                callback(0, "Invalid User !", "", 401); /*response with 401 header status*/

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});






/*Teacher : Help A Kid Study Status Update*/
router.post('/teacherhelpakidstudystatusupdate', function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message});

    }


    var helpAKidId = req.body.helpAKidId;

    if(req.body.uniqueUserId == "") {

        callback(0, "User Id Should Not Be Empty !", "");

    } else if(req.body.helpAKidId == "") {

        callback(0, "Kid Id Should Not Be Empty !", "");

    }  else if(req.body.Action == "") {

        callback(0, "Action Should Not Be Empty !", "");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {




            if (data.length > 0) {

                var teacherUserId = data[0].userId;

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                teachermodel.getHelpAKidStudyDetails(helpAKidId, teacherUserId) /*get HelpAKidStudy Details*/
                .then(function(kidStudyData){

                    

                    if(kidStudyData.length > 0){

                        if(req.body.Action==3)/*If Ignoring*/  /*Actions ==> /* 1=Helping, 2=Will Look InTo It, 3=Ignore */
                        {

                            /*check - Current Teacher Already Helping or LookingToIt or Ignored*/
                            teachermodel.dbGetCheckMeHelpAkidTeacherActions(teacherUserId, helpAKidId)
                            .then(function (helpAKidTeacher) {
                                
                                 console.log(helpAKidTeacher);

                                if(helpAKidTeacher.length){

                                    var myAction = helpAKidTeacher[0].Action;

                                    var myhelpAKidActionId = helpAKidTeacher[0].helpAKidActionId;

                                    if(myAction==3){

                                         /*response*/
                                        callback(0, "Already Ignored !");/*response*/

                                    } else {

                                            /*ignoring - update*/
                                            var Table = "helpAKidStudyTeacherActions";

                                            var updateData = { "Action":3,  "updatedOn" : dateymd };

                                            var Condition = {"helpAKidActionId" : myhelpAKidActionId};



                                            sharedmodel.dbupdate(Table, updateData, Condition)/*insert tuition center into table*/
                                            .then(function () {

                                                /*response*/
                                                callback(200, "Ignored");/*response*/


                                            })
                                            .catch(function(err){

                                                /*response*/
                                                 callback(0, "Failed To Ignored !");/*response*/

                                            });

                                    }

                                  

                                } else {

                                    /*ignoring - insert*/
                                    var Table = "helpAKidStudyTeacherActions";

                                    var insertData = {

                                                        "helpAKidId": helpAKidId,

                                                        "teacherUserId": teacherUserId,

                                                        "Action": 3,

                                                        "updatedOn" : dateymd

                                                    };


                                    sharedmodel.dbinsert(Table, insertData)/*insert tuition center into table*/
                                    .then(function () {

                                        /*response*/
                                        callback(200, "Ignored");/*response*/


                                    })
                                    .catch(function(err){

                                        /*response*/
                                         callback(0, "Failed To Ignored !");/*response*/

                                    });


                                }
                            
                            })
                            .catch(function(err){

                                /*response*/
                                callback(0, "Failed To Update !");/*response*/


                            });


                        } else { /* If user Action is 1=Helping or 2=Will Look InTo It */


                              /*check - Other Teacher Already Helping or Will Look InTo It*/
                            teachermodel.dbGetCheckOtherHelpAkidTeacherActions(teacherUserId, helpAKidId)
                            .then(function (helpAKidTeacher) {
                                
                                 console.log(helpAKidTeacher);

                                if(helpAKidTeacher.length>0){ 

                                    /*response*/
                                    callback(0, "Others Already Taken !");/*response*/

                                } else {

                                    /*check - Current Teacher Already Helping or LookingToIt or Ignored*/
                                    teachermodel.dbGetCheckMeHelpAkidTeacherActions(teacherUserId, helpAKidId)
                                    .then(function (helpAKidMeTeacher) {
                                        
                                         console.log(helpAKidMeTeacher);

                                        if(helpAKidMeTeacher.length){

                                            var myAction = helpAKidMeTeacher[0].Action;

                                            var myhelpAKidActionId = helpAKidMeTeacher[0].helpAKidActionId;

                                            /*Helping or Will Look Into It - update*/
                                            var Table = "helpAKidStudyTeacherActions";

                                            var updateData = { "Action": req.body.Action , "updatedOn" : dateymd};

                                            var Condition = {"helpAKidActionId" : myhelpAKidActionId};

                                            sharedmodel.dbupdate(Table, updateData, Condition)/*insert tuition center into table*/
                                            .then(function (UpdateRes) {

                                                /*response*/
                                                callback(200, "Thank You For Your Interest");/*response*/


                                            })
                                            .catch(function(err){

                                                /*response*/
                                                 callback(0, "Failed To Update !");/*response*/

                                            });


                                        } else {

                                            /*Helping or Will Look Into It - insert*/
                                            var Table = "helpAKidStudyTeacherActions";

                                            var insertData = {

                                                                "helpAKidId": helpAKidId,

                                                                "teacherUserId": teacherUserId,

                                                                "Action": req.body.Action,

                                                                "updatedOn" : dateymd

                                                            };


                                            sharedmodel.dbinsert(Table, insertData)/*insert tuition center into table*/
                                            .then(function () {

                                                /*response*/
                                                callback(200, "Thank You For Your Interest");/*response*/


                                            })
                                            .catch(function(err){

                                                /*response*/
                                                 callback(0, "Failed To Update !");/*response*/

                                            });


                                        }
                                    
                                    })
                                    .catch(function(err){

                                        /*response*/
                                        callback(0, "Failed To Update !");/*response*/


                                    });


                                }

                            })
                            .catch(function(err){

                                /*response*/
                                callback(0, "Failed To Update !");/*response*/

                            });

                        }

                        
                    } else {

                        callback(0, "Invalid Help A Kid Id!","");

                    }
                    
                })
                .catch(function(err){

                    console.log(err);
                    callback(0, "Failed To Get Details !", "");/*response*/

                });


            } else {

                callback(0, "Invalid User !", "");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });
    }

});




/*teacher : user rating tlist*/
router.post('/teacheruserratings',function(req, res){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    /*get user rating*/
                    teachermodel.getTeacherUserReviews(userId)
                    .then(function(reviews){
                       
                        callback(200, "Success", reviews);

                    })
                    .catch(function(err)
                    {
                            
                        console.log(err);
                        callback(0, "Failed to Get Details !");

                    });


                } else {

                    callback(0,"Invalid User !");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed to Get Details !");

            });

    }

});



/*teacher : send recommendation request*/
router.post('/teachersendrecommendationrequest',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var senderName = data[0].Fname;

                    var userRole = data[0].userRole;

                    sharedmodel.dbgetdetails("profileId", "teacherprofile", {"userId":userId})/*get teacher profileId*/
                    .then(function(teacherProfile){

                        //console.log(teacherProfile);

                        var teacherProfileId = teacherProfile[0].profileId;

                        var dt = datetime.create();

                        var dateymd = dt.format('Y-m-d H:M:S');

                        var recommendUniqueId = uniqid();

                        /*insert request*/
                        var table = "teacherPublicRecommendations";

                        var insertdata = {

                            "teacherUserId":userId,

                            "recommendUniqueId":recommendUniqueId,

                            "requestSentToEmail":req.body.requestSentToEmail,

                            "recommendationStatus":1,

                            "updatedOn":dateymd

                        };

                        var baseurl = shared.getbaseurl();/*base url*/

                        var recommendUrl = baseurl+'/recommendation/'+recommendUniqueId+'/'+teacherProfileId;

                        sharedmodel.dbinsert(table, insertdata)  /*insert request*/
                        .then(function(request){

                                /*get admin email*/
                                sharedmodel.getadminemail()
                                .then(function (adminemailres) {
                                    var adminemail = adminemailres[0].Email;
                                    var emailfrom = adminemail;
                                    var emailto = req.body.requestSentToEmail;
                                    var subject = 'GoTuition : '+senderName+' Sent You A Recommendation Request';

                                    /*email message*/
                                    var emailmessage = '<strong> Hi, </strong><br>';
                                    emailmessage += 'GoTuition : '+senderName+' Sent You A Recommendation Request.'; 
                                    emailmessage += '<br>';   
                                    emailmessage += 'Go and Recommend : '+recommendUrl;   
                                    emailmessage += '<br>';  
                                    emailmessage += '<br>';   
                                     
                                    /*send email*/
                                    shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/

                                    /*response*/
                                    callback(200, "Request Sent");


                                })
                                .catch(function (err) {
                                    
                                    console.log(err);
                                    callback(0, "Request Failed !");

                                });
     

                        })
                        .catch(function(err)
                        {
                                
                            console.log(err);
                            callback(0, "Request Failed !");

                        });


                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Request Failed !");

                    });


                } else {

                    callback(0,"Invalid User !");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Request Failed !");

            });

    }

});






/* teacher profile share card image upload */
router.post('/teacher-profile-share-card-image-upload', function (req, res) {

        const callback = function (status, message, details) {
            res.json({ "status": status, "message": message, "details":details }).end();

        };


        if(req.body.uniqueUserId==""){

             callback(0,"User Id Should Not Be Empty !");

        } else if(req.body.shareCardImageBase64==""){

            callback(0,"Base 64 Should Not Be Empty !");

        } else {

            sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var dtnow = dt.now();

                    var shareCardImageBase64 = req.body.shareCardImageBase64;

                    var uploadFileName = dtnow + '_ShareCard.png';

                    var removeString = 'data:image/png;base64,'; 

                    // var base64Data = chatAttachment.replace(/^data:image\/png;base64,/, "");
                    var base64Data = shareCardImageBase64.replace(removeString, ""); /*remove file type string from base64 to get proper output*/

                    var tempDir = "uploads/Temp/"+uploadFileName; /*upload temp path*/

                    var uploadDir = "uploads/"+req.body.uniqueUserId+"/shareCards/";

                    var cardUploadPath = req.body.uniqueUserId+"/shareCards/"+uploadFileName;

                    fs.writeFile(tempDir, base64Data, 'base64', function(err) { /* write file to temp path */

                        console.log(err+"555");

                        console.log(tempDir);

                        console.log(uploadDir);

                        console.log(uploadFileName);

                        /*create directory and move file*/
                        shared.movefile(tempDir,uploadDir,uploadFileName)
                        .then(function(data){

                            console.log(data);
                            if(data==1){ /*success*/

                                  var teacherTable = "teacherprofile";

                                  var updateData={ /*update data*/

                                      "shareCardImagePath":cardUploadPath,
                                      "updatedOn" : dateymd

                                  };

                                  var condition = {"userId":userId};

                                  sharedmodel.dbupdate(teacherTable, updateData, condition) /*insert my Chat Details*/
                                  .then((shareCard) => {

                                    /*response data*/
                                    var cardData = {  
                                          
                                          "shareCardImagePath":cardUploadPath                                
                                      };
                         
                                    callback(200, "Success",  cardData);/*response*/
        

                                  })
                                  .catch(

                                    (err) => { console.log(err); callback(0, 'Request Failed !');/*response*/ }

                                  );

                            }
                        })
                        .catch(function(err){

                              console.log(err);
                              callback(0, "File Upload Failed !");

                        });

                    });
     

                } else {

                    callback(0,"Invalid User !");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Request Failed !");

            });

        }
 
});


 
 

module.exports = router;



