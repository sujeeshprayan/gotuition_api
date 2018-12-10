/*jslint es6:true*/
/*global require, module,  __dirname */

"use strict";
var express = require('express');
var router = express.Router();
var db = require('../config/db');
var uniqid = require('uniqid');
var uuidv4 = require('uuid/v4');
var randomize = require('randomatic');
var emailvalidator = require('email-validator'); 
var usermodel = require('../models/usermodule');
var shared = require('./shared/shared');
var sharemodel = require('../models/shared/shared');
var datetime = require('node-datetime');
var bcryptnodejs = require('bcrypt-nodejs');
var formidable = require('formidable');
var _ = require('lodash');
var mv = require('mv');
var fs = require('fs');
var trim = require('trim');
var split = require('split-string');
//var cors = require('cors');



/*insert user*/
router.post('/insertuser', function (req, res) {
    var dt = datetime.create();
    var dateymd = dt.format('Y-m-d H:M:S');
    var datenow = dt.now(); /*current timestamp in milliseconds*/
    var otp = randomize('0', 4);
    var emailverifycode = randomize('A0', 10);
    var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */
    //console.log(otp);
    // console.log(datenow);
    // console.log(dateotpExpTime);

    req.body.userToken = uuidv4();
    req.body.uniqueUserId = uniqid();
    req.body.otp = otp;
    req.body.emailVerifyCode = emailverifycode;
    req.body.otpGenTime = dateymd;
    req.body.otpExpTime = dateotpExpTime;
    req.body.createdOn = dateymd;
    req.body.updatedOn = dateymd;

    const callback = function (status, message, value) {
        res.status = status;
        res.json({"status": status, "message": message, "value": value});
    };

    if (req.body.Phone === "") {

        callback(0, "Phone Should Not Be Empty !", "");

    } else if (req.body.Email === "") {

        callback(0, "Email Should Not Be Empty !", "");

    } else if (req.body.nickName === "") {

        callback(0, "Nick Name Should Not Be Empty !", "");

    } else if (!emailvalidator.validate(req.body.Email)) {/*check email format*/

        callback(4, "Invalid Email Format!", "");

    } else {

        var baseurl = shared.getbaseurl();

        /* smsmessage */
        var smsmessage = "GoTuition Signup OTP: " + req.body.otp + "  Do not share with anyone.";

        var promises = [];/*array for handling multiple query results*/

        promises[0] = usermodel.emailexistcheck(req.body.Email);

        promises[1] = usermodel.phoneexistcheck(req.body.Phone);

        Promise.all(promises).then(function (data) {

            console.log(data);

            var emailData = data[0];

            var phoneData = data[1];

           
           // if (emailData.length > 0 && phoneData.length > 0) {
                //callback(0, "Email and Phone Already Exists !", "");
           // } else 

            if (phoneData.length > 0) {

                var phoneDataUserId = data[1][0].userId;

                var phoneDataPhoneVerified = data[1][0].phoneVerified;

                var phoneDataEmail = data[1][0].Email;

                var phoneDataUserRole = data[1][0].userRole;

                var phoneDataUniqueUserId = data[1][0].uniqueUserId;

                var phoneDataPassword = data[1][0].Password;

                console.log("pass+++"+phoneDataPassword);
                console.log(data[1]);

                /* emailmessage */
                var emailmessage = '<strong> Hi, '+req.body.nickName+'</strong><br><br>';
                emailmessage += 'Please verify your email here : ' + baseurl + '/registration/email-verification/' + phoneDataUniqueUserId + '/' + emailverifycode;

                if(phoneDataPhoneVerified==1 && phoneDataPassword!=null) /*check phone verified && Password exists - completed profile basic steps*/
                {

                    callback(0, "Phone Already Exists !", "");

                } else {

                    
                    if(phoneDataEmail==req.body.Email) /*check email same or not for phone*/
                    {

                        var updateTable = "users";

                        var updateData = { 

                            "nickName": req.body.nickName,

                            "Fname": req.body.nickName,

                            "otp": req.body.otp,

                            "otpGenTime": req.body.otpGenTime, 

                            "otpExpTime": req.body.otpExpTime, 

                            "userRole": req.body.userRole,

                            "updatedOn":dateymd
                        };

                        var userCondition = { "userId": phoneDataUserId };
                       
                        sharemodel.dbupdate(updateTable, updateData, userCondition)
                        .then(function(){



                             /* insert necessary entries in tables for each user roles*/
                            if (req.body.userRole == '4') {   /*Teacher*/

                                 sharemodel.dbgetdetails("userId","teacherprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                .then(function(profileTeacherData){

                                    if(profileTeacherData.length==0){ /*if not exists, insert Teacher into profile table*/

                                        /*insert teacher-tuition center into table*/
                                        var teacherUserId = phoneDataUserId;
                                        var tuitionTable = "tuitioncenters";/*insert table*/
                                        var tuitionData = {
                                            "teacherUserId": teacherUserId
                                        };
                                        sharemodel.dbinsert(tuitionTable, tuitionData);/*insert teacher-tuition center into table*/

                                        /* teacher profile insert */
                                        var randomkey1 = randomize('0', 1);
                                        var randomkey2 = randomize('0', 1);
                                        var nickName = req.body.nickName;

                                        var splitNickName = split(nickName, {separator: ' '});

                                        var trimNickNameItem = ''; 
                                       
                                        var i =1;

                                        splitNickName.forEach(function(item, index, array){ /*foreach split*/
         
                                            trimNickNameItem += trim(item); /*concatinate the strings*/

                                            if( i == splitNickName.length ){ /*last loop*/

                                                var cleanNickName = trimNickNameItem;

                                                var profileId = cleanNickName + '_' + randomkey1 + teacherUserId + randomkey2;
                                                var profileTable = "teacherprofile";
                                                var profileData = {
                                                    "userId": teacherUserId,
                                                    "profileId": profileId
                                                };

                                                sharemodel.dbinsert(profileTable, profileData); /* teacher profile insert */

                                            }

                                            i+=1; /*counter inc*/

                                        });

                                    }

                                })
                                .catch(function(err){

                                    console.log(err);

                                });


                            }


                            if (req.body.userRole == '5') {   /*Parent*/

                                 sharemodel.dbgetdetails("userId","parentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                .then(function(profileParentData){

                                    if(profileParentData.length==0){ /*if not exists, insert Parent into profile table*/

                                        /*insert parent user id into table*/
                                        var parentUserId = phoneDataUserId;
                                        var parentTable = "parentprofile";/*insert table*/
                                        var parentData = {
                                            "userId": parentUserId,
                                            "updatedOn": dateymd
                                        };
                                       
                                        sharemodel.dbinsert(parentTable, parentData);/*insert Parent into profile table*/

                                   }

                                })
                                .catch(function(err){

                                    console.log(err);

                                });

                            }


                            if (req.body.userRole == '6') {   /*Student*/

                                sharemodel.dbgetdetails("userId","studentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                .then(function(profileStudentData){

                                    if(profileStudentData.length==0){ /*if not exists, insert Student into profile table*/

                                        /*insert student user id into table*/
                                        var studentUserId = phoneDataUserId;
                                        var studentTable = "studentprofile";/*insert table*/
                                        var studentData = {
                                            "userId": studentUserId,
                                            "updatedOn":dateymd
                                        };
                                        sharemodel.dbinsert(studentTable, studentData);/*insert student into profile table*/

                                   }

                                })
                                .catch(function(err){

                                    console.log(err);

                                });

                            }


                            if(phoneDataUserRole != req.body.userRole) { /*if current userrole not equal to old userrole*/

                                if(phoneDataUserRole==2){ /*if already phone user is a manager*/

                                    sharemodel.dbremove("managerprofile", {"userId":phoneDataUserId});

                                } else if(phoneDataUserRole==3){ /*if already phone user is a agent*/

                                    sharemodel.dbremove("agentprofile", {"userId":phoneDataUserId});

                                } else if(phoneDataUserRole==4){ /*if already phone user is a teacher*/

                                    sharemodel.dbremove("teacherprofile", {"userId":phoneDataUserId});

                                } else if(phoneDataUserRole==5){ /*if already phone user is a parent*/

                                    sharemodel.dbremove("parentprofile", {"userId":phoneDataUserId});

                                } else if(phoneDataUserRole==6){ /*if already phone user is a student*/

                                    sharemodel.dbremove("studentprofile", {"userId":phoneDataUserId});

                                } 
                            }


                            /*sms*/
                            shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/

                            /*response*/
                            callback(200, "Successfully Registered", phoneDataUniqueUserId);


                        })
                        .catch(function(err){

                            /*response*/
                            callback(0, "Insertion Failed", "");

                        });

                       

                    } else {

                        if(emailData.length > 0){ /* email alreday exists*/

                             callback(0, "Email Already Exists !", "");

                        } else {

                            var updateTable = "users";

                            var updateData = { 

                                "nickName": req.body.nickName,

                                "Fname": req.body.nickName,

                                "Email": req.body.Email,

                                "otp": req.body.otp,

                                "otpGenTime": req.body.otpGenTime, 

                                "otpExpTime": req.body.otpExpTime, 

                                "userRole": req.body.userRole,

                                "emailVerifyCode": emailverifycode,

                                "updatedOn":dateymd
                            };

                            var userCondition = { "userId": phoneDataUserId };
                           
                             sharemodel.dbupdate(updateTable, updateData, userCondition)
                            .then(function(){



                                 /* insert necessary entries in tables for each user roles*/
                                if (req.body.userRole == '4') {   /*Teacher*/

                                     sharemodel.dbgetdetails("userId","teacherprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                    .then(function(profileTeacherData){

                                        if(profileTeacherData.length==0){ /*if not exists, insert Teacher into profile table*/

                                            /*insert teacher-tuition center into table*/
                                            var teacherUserId = phoneDataUserId;
                                            var tuitionTable = "tuitioncenters";/*insert table*/
                                            var tuitionData = {
                                                "teacherUserId": teacherUserId
                                            };
                                            sharemodel.dbinsert(tuitionTable, tuitionData);/*insert teacher-tuition center into table*/

                                            /* teacher profile insert */
                                            var randomkey1 = randomize('0', 2);
                                            var randomkey2 = randomize('0', 3);
                                            var nickName = req.body.nickName;

                                            var splitNickName = split(nickName, {separator: ' '});

                                            var trimNickNameItem = ''; 
                                           
                                            var i =1;

                                            splitNickName.forEach(function(item, index, array){ /*foreach split*/
             
                                                trimNickNameItem += trim(item); /*concatinate the strings*/

                                                if( i == splitNickName.length ){ /*last loop*/

                                                    var cleanNickName = trimNickNameItem;

                                                    var profileId = cleanNickName + '_' + randomkey1 + teacherUserId + randomkey2;
                                                    var profileTable = "teacherprofile";
                                                    var profileData = {
                                                        "userId": teacherUserId,
                                                        "profileId": profileId
                                                    };

                                                    sharemodel.dbinsert(profileTable, profileData); /* teacher profile insert */

                                                }

                                                i+=1; /*counter inc*/

                                            });

                                        }

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                    });


                                }


                                if (req.body.userRole == '5') {   /*Parent*/

                                     sharemodel.dbgetdetails("userId","parentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                    .then(function(profileParentData){

                                        if(profileParentData.length==0){ /*if not exists, insert Parent into profile table*/

                                            /*insert parent user id into table*/
                                            var parentUserId = phoneDataUserId;
                                            var parentTable = "parentprofile";/*insert table*/
                                            var parentData = {
                                                "userId": parentUserId,
                                                "updatedOn": dateymd
                                            };
                                           
                                            sharemodel.dbinsert(parentTable, parentData);/*insert Parent into profile table*/

                                       }

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                    });

                                }


                                if (req.body.userRole == '6') {   /*Student*/

                                    sharemodel.dbgetdetails("userId","studentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                    .then(function(profileStudentData){

                                        if(profileStudentData.length==0){ /*if not exists, insert Student into profile table*/

                                            /*insert student user id into table*/
                                            var studentUserId = phoneDataUserId;
                                            var studentTable = "studentprofile";/*insert table*/
                                            var studentData = {
                                                "userId": studentUserId,
                                                "updatedOn":dateymd
                                            };
                                            sharemodel.dbinsert(studentTable, studentData);/*insert student into profile table*/

                                       }

                                    })
                                    .catch(function(err){

                                        console.log(err);

                                    });

                                }

                                console.log('another email, same phone verified, password not set');

                                if(phoneDataUserRole != req.body.userRole) { /*if current userrole not equal to old userrole*/

                                     if(phoneDataUserRole==2){ /*if already phone user is a manager*/

                                        sharemodel.dbremove("managerprofile", {"userId":phoneDataUserId});

                                    } else if(phoneDataUserRole==3){ /*if already phone user is a agent*/

                                        sharemodel.dbremove("agentprofile", {"userId":phoneDataUserId});

                                    } else if(phoneDataUserRole==4){ /*if already phone user is a teacher*/

                                        sharemodel.dbremove("teacherprofile", {"userId":phoneDataUserId});

                                    } else if(phoneDataUserRole==5){ /*if already phone user is a parent*/

                                        sharemodel.dbremove("parentprofile", {"userId":phoneDataUserId});

                                    } else if(phoneDataUserRole==6){ /*if already phone user is a student*/

                                        sharemodel.dbremove("studentprofile", {"userId":phoneDataUserId});

                                    } 
                                }


                                /*sms*/
                                shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/

                                /*response*/
                                callback(200, "Successfully Registered", phoneDataUniqueUserId);


                            })
                            .catch(function(err){

                                /*response*/
                                callback(0, "Insertion Failed", "");

                            });

                        }

                    }

                }


            } else if (emailData.length > 0) {

                callback(0, "Email Already Exists !", "");

            }   else {
                /*insert user*/
                usermodel.insertuser(req.body)
                    .then(function (data) {
                        if (data.insertId !== "") {

                            /* insert necessary entries in tables for each user roles*/
                            if (req.body.userRole == '4') {   /*Teacher*/

                                /*insert teacher-tuition center into table*/
                                var teacherUserId = data.insertId;
                                var tuitionTable = "tuitioncenters";/*insert table*/
                                var tuitionData = {
                                    "teacherUserId": teacherUserId
                                };
                                sharemodel.dbinsert(tuitionTable, tuitionData);/*insert teacher-tuition center into table*/

                                /* teacher profile insert */
                                var randomkey1 = randomize('0', 2);
                                var randomkey2 = randomize('0', 3);
                                var nickName = req.body.nickName;

                                var splitNickName = split(nickName, {separator: ' '});

                                var trimNickNameItem = ''; 
                               
                                var i =1;

                                splitNickName.forEach(function(item, index, array){ /*foreach split*/
 
                                    trimNickNameItem += trim(item); /*concatinate the strings*/

                                    if( i == splitNickName.length ){ /*last loop*/

                                        var cleanNickName = trimNickNameItem;

                                        var profileId = cleanNickName + '_' + randomkey1 + teacherUserId + randomkey2;
                                        var profileTable = "teacherprofile";
                                        var profileData = {
                                            "userId": teacherUserId,
                                            "profileId": profileId
                                        };

                                        sharemodel.dbinsert(profileTable, profileData); /* teacher profile insert */

                                    }

                                    i+=1; /*counter inc*/

                                });

                            }


                             if (req.body.userRole == '5') {   /*Parent*/

                                /*insert parent user id into table*/
                                var parentUserId = data.insertId;
                                var parentTable = "parentprofile";/*insert table*/
                                var parentData = {
                                    "userId": parentUserId,
                                    "updatedOn": dateymd
                                };
                                sharemodel.dbinsert(parentTable, parentData);/*insert parent into profile table*/

                            }


                            if (req.body.userRole == '6') {   /*Student*/

                                /*insert student user id into table*/
                                var studentUserId = data.insertId;
                                var studentTable = "studentprofile";/*insert table*/
                                var studentData = {
                                    "userId": studentUserId,
                                    "updatedOn":dateymd
                                };
                                sharemodel.dbinsert(studentTable, studentData);/*insert student into profile table*/

                            }


                            /*sms*/
                            shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/

                            /*get admin email*/
                            sharemodel.getadminemail()
                                .then(function (adminemailres) {
                                    var adminemail = adminemailres[0].Email;
                                    var emailfrom = adminemail;
                                    var emailto = req.body.Email;
                                    var subject = 'GoTuition : Verify Your Email';
                                    /* emailmessage */
                                    var emailmessage = '<strong> Hi, '+req.body.nickName+'</strong><br><br>';
                                    emailmessage += 'Please verify your email here : ' + baseurl + '/registration/email-verification/' + req.body.uniqueUserId + '/' + emailverifycode;
                                    /*send email*/
                                    shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });


                            /*response*/
                            callback(200, "Successfully Registered", req.body.uniqueUserId);

                        } else {
                            /*response*/
                            callback(0, "Insertion Failed", "");
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            }
        });
    }

});



/*user table profile details update*/
router.post('/userprofileupdate', function (req, res) {
    var dt = datetime.create();
    var dateymd = dt.format('Y-m-d H:M:S');

    console.log(req);//

    const callback = function (status, message) {
        res.json({"status": status, "message": message});
    };

    shared.GetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (data) {
            if (data.length > 0) {
                var userId = data[0].userId;
                req.body.userId = userId;
                var passwordHash = bcryptnodejs.hashSync(req.body.Password);
                bcryptnodejs.compare(req.body.confirmPassword, passwordHash, function (err, res) {
                    if (err) {
                        callback(0, "Mismatch on Password and Confirm Password !");
                    } else if (!res) {
                        callback(0, "Mismatch on Password and Confirm Password !");
                    } else {


                        console.log(passwordHash);//
                        var table = "users";
                        var updatedata = {
                            "Fname": req.body.Fname,
                            "Lname": req.body.Lname,
                            "nickName": req.body.nickName,
                            "Password": passwordHash,
                            "Gender": req.body.Gender,
                            "ageGroup": req.body.ageGroup,
                            "Address": req.body.Address,
                            "Pincode": req.body.Pincode,
                            "Locality": req.body.Locality,
                            "District": req.body.District,
                            "State": req.body.State,
                            "Country": req.body.Country,
                            "Latitude": req.body.Latitude,
                            "Longitude": req.body.Longitude,
                            "updatedOn": dateymd
                        };
                        var condition = { "userId": userId };
                        sharemodel.dbupdate(table, updatedata, condition)
                            .then(function () {
                                callback(200, "User Profile Updated Successfully");
                            })
                            .catch(function (error) {
                                console.log(error);
                                callback(0, "Failed to Update User Details !");
                            });
                    }
                });
            } else {
                callback(0, "Invalid User !");
            }
        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Failed to Update User Details !");
        });

});

/* resend otp to user */
router.post('/resendotp', function (req, res) {

    const callback = function (status, message) {
        res.json({ "status": status, "message": message });
    };

     if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var dt = datetime.create();
                var dateymd = dt.format('Y-m-d H:M:S');
                var datenow = dt.now(); /*current timestamp in milliseconds*/
                var otp = randomize('0', 4);
            	var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */
                var table = 'users';
                var updateData = {'otp': otp, 'otpGenTime': dateymd, 'otpExpTime': dateotpExpTime};
                var condition = {'uniqueUserId': req.body.uniqueUserId};
                sharemodel.dbupdate(table, updateData, condition)
                    .then(function (data) {
                        console.log(data);
                        /*sms*/
                        var smsmessage = "GoTuition Signup OTP: " + otp + ". Do not share with anyone.";
                        shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/

                        callback(200, "Successfully Sent OTP");

                    })
                    .catch(function (err) {
                        console.log(err);
                        callback(0, "Failed To Send OTP !");

                    });

            } else {

                callback(0, "Invalid User !", "");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Update !", "");

        });

    }
});


/*check user otp*/
router.post('/checkuserotp', function (req, res) {
    var dt = datetime.create();
    var dtnow = dt.now();

    const otpcallback = function (status, message) {
        res.json({ "status": status, "message": message });
    };

    shared.GetUserIdfromUuid(req.body.uuId) /*get userid from uniqueserid*/
        .then(function (data) {
            if (data.length > 0) {
                var userId = data[0].userId;
                req.body.userId = userId;
                usermodel.dbcheckuserotp(req.body)/*db check requested otp*/
                    .then(function (data) {
                        if (data.length > 0) {
                            /*check otp expiry*/

                            if (dtnow < data[0].otpExpTime) {

                                var table = "users";
                                var updatedata = { "phoneVerified": "1", "Status": "1" };
                                var condition = { "userId": userId };
                                sharemodel.dbupdate(table, updatedata, condition)
                                    .then(function () {
                                        otpcallback(200, "OTP is Valid");
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        otpcallback(0, "Failed to Verify OTP !");
                                    });
                            } else {
                                otpcallback(0, "OTP is Expired !");
                            }
                        } else {
                            otpcallback(0, "OTP is Invalid !");
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        otpcallback(0, "Failed to Verify OTP !");
                    });
            } else {
                otpcallback(0, "Invalid User !");
            }
        })
        .catch(function (error) {
            console.log(error);
            otpcallback(0, "Failed to Verify OTP !");
        });
});




/*email verify check*/
router.post('/emailverification', function (req, res) {

    const callback = function (status, message) {
        res.json({ "status": status, "message": message });
    };

    usermodel.dbemailverification(req.body)
        .then(function (data) {
            if (data.length > 0) {

                if (data[0].emailVerified === 1) {
                    callback(0, "Email Already Verified !");
                } else {
                    var table = "users";
                    var updatedata = { "emailVerified": 1 };
                    var condition = { "userId": data[0].userId };
                    sharemodel.dbupdate(table, updatedata, condition)
                        .then(function () {
                            callback(200, "Email Verified Successfully");
                        })
                        .catch(function (error) {
                            console.log(error);
                            callback(0, "Email Verification Failed !");
                        });
                }
            } else {
                callback(0, "Invalid Request !");
            }

        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Email Verification Failed !");
        });
});



/*get pincode details*/
router.post('/getpincodedetails', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    console.log(req.body.Pincode);
    
    if (req.body.Pincode === "") {
        callback(0, "Pincode should not be empty !", "");
    } else {
        usermodel.dbgetpincodedetails(req.body, callback);
    }
});


/*user login*/
router.post('/userlogin', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    //var hash = bcryptnodejs.hashSync("123456");//
    // console.log(hash);//

    usermodel.dbuserlogin(req.body)
        .then(function (data) {
            if (data.length > 0) {

                if(data[0].userRole===4){ /*if teacher, then check agent's teacher or not*/

                    var agentTeacherTable = "agentteachers";

                    var selectFields = "agentTeacherId";

                    var agentTeacherCondition1 = {"teacherUserId": data[0].userId}; /* check agent's teacher or not */

                    var agentTeacherCondition2 = {"joinStatus": '0'}; /* check joined or not*/

                    sharemodel.dbgetdetails2and(selectFields, agentTeacherTable, agentTeacherCondition1,  agentTeacherCondition2 ) /* check agent's teacher or not */
                    .then(function(agentTeacher){

                        console.log(agentTeacher);

                        if(agentTeacher.length > 0){ /*agent's teacher not joined yet*/

                            var userhash = data[0].Password;

                            bcryptnodejs.compare(req.body.Password, userhash, function (err, res) {
                                if (res) {
                                    console.log('true');

                                    sharemodel.dbupdate("users",{"emailVerified":1}, {"userId":data[0].userId}) /* update emailVerified status to DB */
                                    .then(function(){

                                        sharemodel.dbupdate(agentTeacherTable, {"joinStatus":'1'}, {"teacherUserId":data[0].userId}) /* update agent's teacher joined status to DB */
                                        .then(function(){

                                            var userdata = {
                                                "uniqueUserId": data[0].uniqueUserId,
                                                "Fname": data[0].Fname,
                                                "Lname": data[0].Lname,
                                                "nickName": data[0].nickName,
                                                "Email": data[0].Email,
                                                "Gender": data[0].Gender,
                                                "Phone": data[0].Phone,
                                                "userRole": data[0].userRole,
                                                "phoneVerified": data[0].phoneVerified,
                                                "emailVerified": 1,
                                                "Longitude": data[0].Longitude,
                                                "Latitude": data[0].Latitude,
                                                "Address": data[0].Address,
                                                "lastLoggedIn": data[0].lastLoggedIn,
                                                "updatedOn": data[0].updatedOn
                                            };

                                            /*logged in time update to DB*/
                                            var dt = datetime.create();
                                            var dateymd = dt.format('Y-m-d H:M:S');
                                            var table = "users";
                                            var updatedata = { "lastLoggedIn": dateymd };
                                            var condition = { "userId": data[0].userId }; 
                                            sharemodel.dbupdate(table, updatedata, condition); /* logged in time updation*/

                                            console.log(condition);

                                            callback(1, "Successfully LoggedIn", userdata); /*response*/
                                            

                                        })
                                        .catch(function(err){

                                            console.log(err);
                                            callback(0, "Login Failed.", "");

                                        });


                                    })
                                    .catch(function(err){

                                        console.log(err);
                                        callback(0, "Login Failed.", "");


                                    });

                                    

                                } else {
                                    console.log(err);
                                    console.log('false');
                                    callback(0, "Login Failed. Incorrect Password !", "");
                                }
                            });


                        } else { /* not a agent's teacher or already joined*/

                            console.log("not a agent's teacher or already joined");

                            var userhash = data[0].Password;

                            bcryptnodejs.compare(req.body.Password, userhash, function (err, res) {
                                if (res) {
                                    console.log('true');

                                    var userdata = {
                                        "uniqueUserId": data[0].uniqueUserId,
                                        "Fname": data[0].Fname,
                                        "Lname": data[0].Lname,
                                        "nickName": data[0].nickName,
                                        "Email": data[0].Email,
                                        "Gender": data[0].Gender,
                                        "Phone": data[0].Phone,
                                        "userRole": data[0].userRole,
                                        "phoneVerified": data[0].phoneVerified,
                                        "emailVerified": data[0].emailVerified,
                                        "Longitude": data[0].Longitude,
                                        "Latitude": data[0].Latitude,
                                        "Address": data[0].Address,
                                        "lastLoggedIn": data[0].lastLoggedIn,
                                        "updatedOn": data[0].updatedOn
                                    };

                                    /*logged in time update to DB*/
                                    var dt = datetime.create();
                                    var dateymd = dt.format('Y-m-d H:M:S');
                                    var table = "users";
                                    var updatedata = { "lastLoggedIn": dateymd };
                                    var condition = { "userId": data[0].userId }; 
                                    sharemodel.dbupdate(table, updatedata, condition); /* logged in time updation*/

                                    console.log(condition);

                                    callback(1, "Successfully LoggedIn", userdata); /*response*/

                                } else {
                                    console.log(err);
                                    console.log('false');
                                    callback(0, "Login Failed. Incorrect Password !", "");
                                }
                            });


                        }


                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Login Failed.", "");

                    });

                } else {

                    /*check username is phone or email : check email format and email verify status*/
                    if (emailvalidator.validate(req.body.Username) && data[0].emailVerified === 0) {
                        callback(0, "Login Failed. Email Not Verified !", "");
                    } else if (data[0].phoneVerified === 0) {
                        callback(0, "Login Failed. Phone Number Not Verified !", "");
                    } else if (data[0].userRole === 1 || data[0].userRole === 2 || data[0].userRole === 3) {
                        callback(0, "Login Failed. Invalid Role Entry !", "");
                    } else if (data[0].Status === 1) {

                        var userhash = data[0].Password;

                        bcryptnodejs.compare(req.body.Password, userhash, function (err, res) {
                            if (res) {
                                console.log('true');

                                var userdata = {
                                    "uniqueUserId": data[0].uniqueUserId,
                                    "Fname": data[0].Fname,
                                    "Lname": data[0].Lname,
                                    "nickName": data[0].nickName,
                                    "Email": data[0].Email,
                                    "Gender": data[0].Gender,
                                    "Phone": data[0].Phone,
                                    "userRole": data[0].userRole,
                                    "phoneVerified": data[0].phoneVerified,
                                    "emailVerified": data[0].emailVerified,
                                    "Longitude": data[0].Longitude,
                                    "Latitude": data[0].Latitude,
                                    "Address": data[0].Address,
                                    "lastLoggedIn": data[0].lastLoggedIn,
                                    "updatedOn": data[0].updatedOn
                                };

                                /*logged in time update to DB*/
                                var dt = datetime.create();
                                var dateymd = dt.format('Y-m-d H:M:S');
                                var table = "users";
                                var updatedata = { "lastLoggedIn": dateymd };
                                var condition = { "userId": data[0].userId }; 
                                sharemodel.dbupdate(table, updatedata, condition); /* logged in time updation*/

                                console.log(condition);

                                callback(1, "Successfully LoggedIn", userdata); /*response*/

                            } else {
                                console.log(err);
                                console.log('false');
                                callback(0, "Login Failed. Incorrect Password !", "");
                            }
                        });
                    } else {
                        callback(0, "User Not Activated !", "");
                    }

                }

            } else {
                callback(0, "Login Failed. Incorrect Username !", "");
            }

        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Login Failed !", "");
        });
});


/*forgot password request*/
router.post('/forgotpasswordrequest', function (req, res) {

    const callback = function (status, message, uniqueUserId) {
        res.json({ "status": status, "message": message, "uniqueUserId": uniqueUserId });
    };

    usermodel.dbforgotpasswordrequest(req.body)
        .then(function (data) {
            if (data.length > 0) {
                if (data[0].Status === 1) {
                    /*update otp in db*/
                    var dt = datetime.create();
                    var dateymd = dt.format('Y-m-d H:M:S');
                    var datenow = dt.now(); /*current timestamp in milliseconds*/
                    var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */
                    var otpGenTime = dateymd;
                    var otpExpTime = dateotpExpTime;
                    var otp = randomize('0', 4);
                    req.body.otp = otp;
                    var table = "users";
                    var updatedata = { "otp": otp, "otpGenTime": otpGenTime, "otpExpTime": otpExpTime };
                    var condition = { "userId": data[0].userId };
                    sharemodel.dbupdate(table, updatedata, condition)
                        .then(function () {
                            /*sms*/
                            var smsmessage = "GoTuition Password OTP: " + req.body.otp + ". Do not share with anyone.";
                            shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/
                            callback(1, "Check your phone for OTP", data[0].uniqueUserId);
                        })
                        .catch(function (error) {
                            console.log(error);
                            callback(0, "Request Failed !", "");
                        });


                } else {
                    callback(0, "User Not Activated !", "");
                }
            } else {
                callback(0, "Phone Not Registered !", "");
            }

        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Request Failed !", "");

        });
});


/*reset password request*/
router.post('/resetpasswordrequest', function (req, res) {

    const callback = function (status, message, uniqueUserId) {
        res.json({ "status": status, "message": message, "uniqueUserId": uniqueUserId });
    };

    if(req.body.uniqueUserId==""){

         callback(0, "User Id Should Not Be Empty !", "");

    } else if(req.body.Phone==""){

         callback(0, "Phone Should Not Be Empty !", "");

    } else {

        usermodel.dbresetpasswordrequest(req.body)
        .then(function (data) {
            if (data.length > 0) {
                if (data[0].Status === 1) {
                    /*update otp in db*/
                    var dt = datetime.create();
                    var dateymd = dt.format('Y-m-d H:M:S');
                    var datenow = dt.now(); /*current timestamp in milliseconds*/
                    var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */
                    var otpGenTime = dateymd;
                    var otpExpTime = dateotpExpTime;
                    var otp = randomize('0', 4);
                    req.body.otp = otp;
                    var table = "users";
                    var updatedata = { "otp": otp, "otpGenTime": otpGenTime, "otpExpTime": otpExpTime };
                    var condition = { "userId": data[0].userId };
                    sharemodel.dbupdate(table, updatedata, condition)
                        .then(function () {
                            /*sms*/
                            var smsmessage = "GoTuition Password OTP: " + req.body.otp + ". Do not share with anyone.";
                            shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/
                            callback(1, "Check your phone for OTP", data[0].uniqueUserId);
                        })
                        .catch(function (error) {
                            console.log(error);
                            callback(0, "Request Failed !", "");
                        });


                } else {
                    callback(0, "User Not Activated !", "");
                }
            } else {

                callback(0, "Phone Is Incorrect. Please Enter Your Correct Phone !", "");

            }

        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Request Failed !", "");

        });
    }
});


/*update password*/
router.post('/updatepassword', function (req, res) {

    const callback = function (status, message) {
        res.json({ "status": status, "message": message });
    };

    shared.GetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (data) {
            if (data.length > 0) {
                var userId = data[0].userId;
                req.body.userId = userId;
                req.body.passwordHash = bcryptnodejs.hashSync(req.body.Password);/*create hash for newpassword*/
                usermodel.dbupdatepassword(req.body)
                    .then(function () {
                        callback(1, "Password Updated Successfully");
                    })
                    .catch(function (error) {
                        console.log(error);
                        callback(0, "Password Updation Failed !");
                    });
            } else {
                callback(0, "Invalid User !");
            }
        })
        .catch(function (error) {
            console.log(error);
            callback(0, "Password Updation Failed !");
        });

});



/* user profile pic upload */
router.post('/userprofilepic_upload', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details":details }).end();

    };

 
    var allowedTypes = ['image/gif', 'image/jpeg', 'image/png'];

    var maxFileSize = 1 * 1024 * 1024;

    var form = new formidable.IncomingForm();

    //form.maxFileSize = maxFileSize;
    
    form.parse(req,function(err, fields, files){

        console.log(fields);

        console.log(files);

        var uploadFile = files.uploadFile || null;

        var uniqueUserId = fields.uniqueUserId;

        if (uniqueUserId == "" && uploadFile == null) {

            console.log("User Id And File Should Not Be Empty !");
            callback(0, "User Id And File Should Not Be Empty !");

        } else if (uniqueUserId == "") {

            console.log("Id Should Not Be Empty !");
            callback(0, "Id Should Not Be Empty !");


        } else if (uploadFile == null) {

            console.log("File Should Not Be Empty !");
            callback(0, "File Should Not Be Empty !");

        }
        else
        {


            var tmpDir =  uploadFile.path;

            var fileType = uploadFile.type;

            var fileSize = uploadFile.size;

            if (_.indexOf(allowedTypes, fileType) == -1) {

                console.log("Un-supported file format. You can upload JPEG, PNG or GIF format !");
                callback(0, "Un-supported File Format. Upload JPEG, PNG or GIF Format !");

            }
            else if (fileSize>maxFileSize) {

                  console.log("Picture Size Is Too High. Upload Below 1MB !");
                  callback(0, "Picture Size Is Too High. Upload Below 1MB !");

            }
            else {

                console.log(fileType);

                console.log(fileSize);

                console.log(tmpDir);

                var newDir = 'uploads/'+uniqueUserId+'/profilePic/';

                var dt = datetime.create();

                var dtnow = dt.now();

                var fileName = dtnow + '_' + files.uploadFile.name;

                files.uploadFile.name = fileName;

                var newFilePath = uniqueUserId+'/profilePic/'+fileName;

                shared.GetUserIdfromUuid(uniqueUserId) /*get userid from uniqueUserid*/
                .then(function (data) {

                    if (data.length > 0) {
                        var userId = data[0].userId;
                        var profilePicPrev = data[0].profilePic;
                        console.log(profilePicPrev); 
                        /*create directory and move file*/
                        shared.movefile(tmpDir,newDir,fileName)
                        .then(function(data){

                            console.log(data);
                            if(data==1){

                                /*update to db*/
                                var dateymd = dt.format('Y-m-d H:M:S');

                                var table = "users";/*update table*/

                                var updateData = {
                                    "profilePic": newFilePath,
                                    "updatedOn": dateymd
                                };

                                var dpCondition = { "uniqueUserId": uniqueUserId };

                                sharemodel.dbupdate(table, updateData, dpCondition)/*update profilepicture into table*/
                                    .then(function (dpData) {

                                        console.log(dpData); 
                                        console.log(profilePicPrev); 
                                        console.log(newFilePath); 
                                        if(profilePicPrev!="")/*delete previous file if exists*/
                                        {
                                            
                                            /*remove*/
                                            var unlink_pic = 'uploads/'+profilePicPrev;
                                            fs.unlink(unlink_pic, function(err){
                                                if(err){
                                                    console.log(err);
                                                    console.log("Previous file remove failed !");
                                                } else {

                                                    console.log("removed previous file"); 
                                                }

                                            });
                                        }

                                        callback(200, "Successfully Updated Profile Picture !", newFilePath );

                                    })
                                    .catch(function(err){

                                        console.log(err);
                                        callback(0, "Picture Upload Failed !");

                                    });

                            }
                            else{

                                 callback(0, "Picture Upload Failed !");

                            }


                        })
                        .catch(function(err){

                            console.log(err);
                            callback(0, "Picture Upload Failed !");

                        });

                    }
                    else
                    {
                         callback(0, "Invalid User !");
                    }
                })
                .catch(function(err){

                    console.log(err);
                    callback(0, "Picture Upload Failed !");

                });

            }
        }
    });

 
});




/*user profile update : name & gender*/
router.post('/userprofilenamegenderupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.Fname==""){

         callback(0,"First Name Should Not Be Empty !");

    } else  if(req.body.Lname==""){

         callback(0,"Last Name Should Not Be Empty !");

    } 
    else  if(req.body.nickName==""){

         callback(0,"Nick Name Should Not Be Empty !");

    } else  if(req.body.Gender==""){

         callback(0,"Gender Should Not Be Empty !");

    } else {

         sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "users";

                    var updatedata = {
                        "Fname": req.body.Fname,
                        "Lname": req.body.Lname,
                        "nickName": req.body.nickName,
                        "ageGroup": req.body.ageGroup,
                        "Gender": req.body.Gender,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharemodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                          callback(200, "User Profile Updated Successfully");

                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Profile Details !");

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




/*user profile update : location & address*/
router.post('/userprofilelocationaddressupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else {

         sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var teacherUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "users";

                    var updatedata = {
                        "Address": req.body.Address,
                        "Pincode": req.body.Pincode,
                        "Locality": req.body.Locality,
                        "District": req.body.District,
                        "State": req.body.State,
                        "Country": req.body.Country,
                        "Latitude": req.body.Latitude,
                        "Longitude": req.body.Longitude,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": teacherUserId };

                    sharemodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                          callback(200, "Address And Location Updated Successfully");

                        })
                        .catch(function (error) {

                            console.log(error);
                            callback(0, "Failed to Update Address And Location !");

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






/*users profile update : alert snooze status*/
router.post('/useralertsnoozestatusupdate',function(req, res){

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

         sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var snoozeDays = req.body.snoozeDays;

                    var snoozedt = datetime.create();

                    snoozedt.offsetInDays(snoozeDays);/*snooze end-date - add days to current date*/

                    var snoozeEndDate = snoozedt.format('Y-m-d H:M:S');

                    if(userRole == 4){ /*teacher*/

                        var updateTable = "teacherprofile";

                    } else if(userRole == 5){ /*parent*/

                        var updateTable = "parentprofile";

                    } else if(userRole == 6){ /*student*/

                        var updateTable = "studentprofile";

                    }

                    var condition = { "userId": userId };

                    var updateData = {
                        "snoozeAlertStatus": req.body.snoozeAlertStatus,
                        "snoozedDateTime": dateymd,
                        "snoozeEndDate": snoozeEndDate,
                        "updatedOn": dateymd
                    };

                   

                    sharemodel.dbupdate(updateTable, updateData, condition)
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


 






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/getusers', function (req, res) {
    console.log(req);
    usermodel.getusers(function (err, rows) {
        res.json(rows);
        console.log(err);
    });
});

router.post('/posttest', function (req, res) {
    //  res.send("posttest is working");
    var postid = req.body.postid;
    // console.log(req);
    console.log(postid);
    // if(postid)
    //  {
    //      res.send("postsid");
    //  }
    //  else
    //  {
    //      res.send("ffff");
    //  }

    db.query("SELECT * FROM users WHERE userId=?", [postid], function (error, results, fields) {
        console.log(fields);
        console.log(postid);
        if (error) {
            res.send(error);
        } else {
            res.send(results);
        }
    });
});

module.exports = router;