/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../../config/db");
var studentmodel = require("../../models/studentmodule");
var teachermodel = require("../../models/teachermodule");
var parentmodel = require("../../models/parentmodule");
var sharemodel = require("../../models/shared/shared");
var commonmodel = require("../../models/commonmodule");
var usermodel = require('../../models/usermodule');
var datetime = require("node-datetime");
var randomize = require("randomatic");
var adminusermodel = require('../../models/admin/usermodule');
var emailvalidator = require('email-validator'); 
var bcryptnodejs = require('bcrypt-nodejs');
var shared = require('../shared/shared');
var uuidv4 = require('uuid/v4');
var uniqid = require('uniqid');



/*admin user login*/
router.post('/adminuserlogin', function (req, res) {

    const callback = function (status, message, details) {
        res.json({ "status": status, "message": message, "details": details });
    };

    if(req.body.Username == ""){

        callback(0, "Username Should Not Be Empty !", "");

    } else if(req.body.Password == ""){

        callback(0, "Password Should Not Be Empty !", "");

    }  else {


    adminusermodel.dbuserlogin(req.body)
        .then(function (data) {
            if (data.length > 0) {
                /*check username is phone or email : check email format and email verify status*/
                if (emailvalidator.validate(req.body.Username) && data[0].emailVerified === 0) {
                    callback(0, "Login Failed. Email Not Verified !", "");
                } else if (data[0].phoneVerified === 0) {
                    callback(0, "Login Failed. Phone Number Not Verified !", "");
               	} else if (data[0].userRole === 4 || data[0].userRole === 5 || data[0].userRole === 6) {
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
                           
                            var otp = randomize('0', 4);

                            var datenow = dt.now(); /*current timestamp in milliseconds*/


                            if(data[0].userRole==1 || data[0].userRole==2 || data[0].userRole==3 ){ /*if admin manager or agent needs otp verification*/
 
                                var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */

                                var table = "users";

                                var updatedata = { 
                                    
                                    "otp": otp,

                                    "otpGenTime": dateymd, 

                                    "otpExpTime": dateotpExpTime, 

                                    "lastLoggedIn": dateymd,

                                    "updatedOn": dateymd

                                    };

                                var condition = { "userId": data[0].userId }; 

                                sharemodel.dbupdate(table, updatedata, condition) /* logged in time  and otp updation*/
                                .then (function(){

                                    /* smsmessage */
                                    var smsmessage = "GoTuition Login OTP: " + otp + "  Do not share with anyone.";
                                    /*sms*/
                                    shared.sendsms(data[0].Phone, smsmessage);/*send otp by sms*/

                                    callback(1, "Success. Please Verify Your OTP", userdata); /*response*/

                                })
                                .catch(function(err){
                   
                                    callback(0, "Login Failed !", "");

                                });


                            } 

                            else { 

                                callback(0, "Invalid User Role !", ""); /*response*/


                                /*if manager or agent : not need otp verification*/

                            //     var table = "users";

                            //     var updatedata = { 

                            //         "lastLoggedIn": dateymd,

                            //         "updatedOn": dateymd

                            //         };

                            //     var condition = { "userId": data[0].userId }; 

                            //     sharemodel.dbupdate(table, updatedata, condition) /* logged in time  and otp updation*/
                            //     .then (function(){


                            //         callback(1, "Successfully LoggedIn", userdata); /*response*/

                            //     })
                            //     .catch(function(err){
                   
                            //         callback(0, "Login Failed !", "");

                            //     });


                            }

 
                        } else {

                            console.log(err);
                            console.log('false');
                            callback(0, "Login Failed. Incorrect Password !", "");

                        }
                    });
                } else {

                    callback(0, "User Not Activated !", "");

                }
            } else {

                callback(0, "Login Failed. Incorrect Username !", "");

            }

        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Login Failed !", "");

        });

    }
});




/*check user login otp*/
router.post('/checkuserloginotp', function (req, res) {

    var dt = datetime.create();
    var dtnow = dt.now();

    const otpcallback = function (status, message, details) {

        res.json({ "status": status, "message": message, "details": details });

    };

    if(req.body.uuId == ""){

        otpcallback(0, "User Id Should Not Be Empty !", "");

    }  else if(req.body.otp == ""){

        otpcallback(0, "OTP Should Not Be Empty !", "");

    }  else {

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

                                otpcallback(200, "OTP is Valid", userdata);
                             
                            } else {

                                otpcallback(0, "OTP is Expired !", "");

                            }

                        } else {

                            otpcallback(0, "OTP is Invalid !", "");

                        }
                    })
                    .catch(function (error) {

                        console.log(error);
                        otpcallback(0, "Failed to Verify OTP !","");

                    });

            } else {

                otpcallback(0, "Invalid User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            otpcallback(0, "Failed to Verify OTP !", "");

        });

    }
});




/*insert agent or manager user*/
router.post('/insertmanageragentuser', function (req, res) {

    var dt = datetime.create();

    var dateymd = dt.format('Y-m-d H:M:S');

    var datenow = dt.now(); /*current timestamp in milliseconds*/

    var otp = randomize('0', 4);

    var autoPassword = randomize('A0', 10);

    var passwordHash = bcryptnodejs.hashSync(autoPassword);

    var dateotpExpTime = datenow + 300000; /*add 5 minutes = 300000 milliseconds */

    var userToken = uuidv4();

    var uniqueUserId = uniqid();


    const callback = function (status, message) {
        res.status = status;
        res.json({"status": status, "message": message});
    };



     if (req.body.Fname === "") {

        callback(0, "Fname Should Not Be Empty !");

    } else if (req.body.Lname === "") {

        callback(0, "Lname Should Not Be Empty !");

    } else if (req.body.Phone === "") {

        callback(0, "Phone Should Not Be Empty !");

    }  else if (req.body.Email === "") {

        callback(0, "Email Should Not Be Empty !");

    } else if (!emailvalidator.validate(req.body.Email)) {/*check email format*/

        callback(4, "Invalid Email Format!");

    } else if (req.body.Address === "") {

        callback(0, "Address Should Not Be Empty !");

    } else if (req.body.Pincode === "") {

        callback(0, "Pincode Should Not Be Empty !");

    } else if (req.body.userRole!=2 && req.body.userRole!=3) {/*user role*/

        callback(0, "Invalid User Role!");

    } else {


        if(req.body.userRole==2){ 

            var userRoleLabel = "Manager";

        } else if(req.body.userRole==3){

            var userRoleLabel = "Agent";

        }

        var baseurl = shared.getbaseurl();

         /* emailmessage */
        var emailmessage = '<strong> Hi, '+req.body.Fname+'</strong><br>';

        emailmessage += '<br>';

        emailmessage += 'Please Start Your Work Here: ' + baseurl + '/admin/login/';

        emailmessage += '<br>';

        emailmessage += 'Username: ' + req.body.Email;

        emailmessage += '<br>';

        emailmessage += 'Password: ' + autoPassword;

        emailmessage += '<br>';
        
        emailmessage += '<br>';  

        emailmessage += '<br>'; 

        var subject = "GoTuition : Added You As A "+userRoleLabel;



        var promises = [];/*array for handling multiple query results*/

        promises[0] = usermodel.emailexistcheck(req.body.Email);

        promises[1] = usermodel.phoneexistcheck(req.body.Phone);

        Promise.all(promises).then(function (data) {

 
            var emailData = data[0];

            var phoneData = data[1];

            if (phoneData.length > 0) {

                var phoneDataUserId = data[1][0].userId;

                var phoneDataPhoneVerified = data[1][0].phoneVerified;

                var phoneDataEmail = data[1][0].Email;

                var phoneDataUserRole = data[1][0].userRole;

                var phoneDataUniqueUserId = data[1][0].uniqueUserId;


                if(phoneDataPhoneVerified==1) /*check phone verified*/
                {

                    callback(0, "Phone Already Exists !");

                } else {

                    
                    if(phoneDataEmail==req.body.Email) /*check email same or not for phone*/
                    {

                        var updateTable = "users";

                        var updateData = {

                            "nickName": req.body.Fname,

                            "Fname": req.body.Fname,

                            "Lname": req.body.Lname,

                            "Password": passwordHash,

                            "userToken": userToken,

                            "userRole": req.body.userRole,

                            "phoneVerified":1,

                            "emailVerified":1,

                            "Address": req.body.Address,

                            "Pincode": req.body.Pincode,

                            "Status":1,

                            "createdOn":dateymd,

                            "updatedOn":dateymd
                        };

                        var userCondition = { "userId": phoneDataUserId };

                        sharemodel.dbupdate(updateTable, updateData, userCondition)
                        .then(function () {


                            
                             if (req.body.userRole == '3') {   /*agent*/


                                sharemodel.dbgetdetails("userId","agentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                .then(function(profileAgentData){

                                    if(profileAgentData.length==0){ /*if not exists, insert agent into profile table*/

                                         /*insert agent user id into table*/
                                        var agentUserId = phoneDataUserId;
                                        var agentTable = "agentprofile";/*insert table*/
                                         /* agent refferalCode*/
                                        var randomkey1 = randomize('0', 2);
                                        var randomkey2 = randomize('0', 3);
                                        var agentData = {
                                            "userId": agentUserId,
                                            "refferalCode": randomkey1 + agentUserId + randomkey2,
                                            "createdBy": 1,
                                            "updatedOn": dateymd
                                        };
                                        sharemodel.dbinsert(agentTable, agentData);/*if not exists, insert agent into profile table*/

                                    }

                                })
                                .catch(function(err){

                                    console.log(err);

                                });
 
                            }


                            if (req.body.userRole == '2') {   /*manager*/


                                 sharemodel.dbgetdetails("userId","managerprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                .then(function(profileManagerData){

                                    if(profileManagerData.length==0){/*if not exists, insert manager into profile table*/

                                        /*insert manager user id into table*/
                                        var managerUserId = phoneDataUserId;
                                        var managerTable = "managerprofile";/*insert table*/
                                        var managerData = {
                                            "userId": managerUserId,
                                            "createdBy": 1,
                                            "updatedOn":dateymd
                                        };
                                        sharemodel.dbinsert(managerTable, managerData);/*insert manager into profile table*/

                                    }


                                })
                                .catch(function(err){

                                    console.log(err);

                                });

                            }




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

                        


                            /*get admin email*/
                            sharemodel.getadminemail()
                            .then(function (adminemailres) {

                                var adminemail = adminemailres[0].Email;
                                var emailfrom = adminemail;
                                var emailto = req.body.Email;
                                var baseurl = shared.getbaseurl();
                                /*send email*/
                                shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/

                                /*response*/
                                callback(200, "Successfully Added New "+userRoleLabel);

                            })
                            .catch(function (err) {

                                console.log(err);
                               
                                /*response*/
                                 callback(0, "Failed To Add");

                            });

                         })
                        .catch(function (err) {

                            /*response*/
                            callback(0, "Failed To Add");

                        });

                    } else {

                        if(emailData.length > 0){ /* email alreday exists*/

                             callback(0, "Email Already Exists !");

                        } else {

                            var updateTable = "users";

                            var updateData = { 

                                "nickName": req.body.Fname,

                                "Fname": req.body.Fname,

                                "Lname": req.body.Lname,

                                "Email": req.body.Email,

                                "Password": passwordHash,

                                "userRole": req.body.userRole,

                                "phoneVerified":1,

                                "emailVerified":1,

                                "Address": req.body.Address,

                                "Pincode": req.body.Pincode,

                                "Status":1,

                                "createdOn":dateymd,

                                "updatedOn":dateymd
                            };

                            var userCondition = { "userId": phoneDataUserId };
                           
                            sharemodel.dbupdate(updateTable, updateData, userCondition)
                            .then(function () {

                                    if (req.body.userRole == '3') {   /*agent*/


                                        sharemodel.dbgetdetails("userId","agentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                        .then(function(profileAgentData){

                                            if(profileAgentData.length==0){ /*if not exists, insert agent into profile table*/

                                                 /*insert agent user id into table*/
                                                var agentUserId = phoneDataUserId;
                                                var agentTable = "agentprofile";/*insert table*/
                                                 /* agent refferalCode*/
                                                var randomkey1 = randomize('0', 2);
                                                var randomkey2 = randomize('0', 3);
                                                var agentData = {
                                                    "userId": agentUserId,
                                                    "refferalCode": randomkey1 + agentUserId + randomkey2,
                                                    "createdBy": 1,
                                                    "updatedOn": dateymd
                                                };
                                                sharemodel.dbinsert(agentTable, agentData);/*if not exists, insert agent into profile table*/

                                            }

                                        })
                                        .catch(function(err){

                                            console.log(err);

                                        });


                                    }


                                    if (req.body.userRole == '2') {   /*manager*/


                                         sharemodel.dbgetdetails("userId","agentprofile",{"userId":phoneDataUserId}) /*check profile already exists*/
                                        .then(function(profileManagerData){

                                            if(profileManagerData.length==0){/*if not exists, insert manager into profile table*/

                                                /*insert manager user id into table*/
                                                var managerUserId = phoneDataUserId;
                                                var managerTable = "managerProfile";/*insert table*/
                                                var managerData = {
                                                    "userId": managerUserId,
                                                    "updatedOn":dateymd
                                                };
                                                sharemodel.dbinsert(managerTable, managerData);/*insert manager into profile table*/

                                            }


                                        })
                                        .catch(function(err){

                                            console.log(err);

                                        });

                                    }



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


                                /*get admin email*/
                                sharemodel.getadminemail()
                                .then(function (adminemailres) {

                                    var adminemail = adminemailres[0].Email;
                                    var emailfrom = adminemail;
                                    var emailto = req.body.Email;
                                    var baseurl = shared.getbaseurl();
                                    /*send email*/
                                    shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/

                                    /*response*/
                                    callback(200, "Successfully Added New "+userRoleLabel);

                                })
                                .catch(function (err) {

                                    console.log(err);
                                   
                                    /*response*/
                                     callback(0, "Failed To Add");

                                });

                             })
                            .catch(function (err) {

                                /*response*/
                                callback(0, "Failed To Add");

                            });

                        }

                    }

                }


            } else if (emailData.length > 0) {

                callback(0, "Email Already Exists !", "");

            }   else {

                /*insert user*/
                var userTable = "users";/*insert table*/

                var userData = {

                    "uniqueUserId": uniqueUserId,

                    "nickName": req.body.Fname,

                    "Fname": req.body.Fname,

                    "Lname": req.body.Lname,

                    "Email": req.body.Email,

                    "Phone": req.body.Phone,

                    "Password": passwordHash,

                    "userToken": userToken,

                    "userRole": req.body.userRole,

                    "phoneVerified":1,

                    "emailVerified":1,

                    "Address": req.body.Address,

                    "Pincode": req.body.Pincode,

                    "Status":1,

                    "createdOn":dateymd,

                    "updatedOn":dateymd
                };

                sharemodel.dbinsert(userTable, userData)
                    .then(function (data) {
                        if (data.insertId !== "") {
 
                             if (req.body.userRole == '3') {   /*agent*/

                                /*insert agent user id into table*/
                                var agentUserId = data.insertId;
                                var agentTable = "agentprofile";/*insert table*/
                                 /* agent refferalCode*/
                                var randomkey1 = randomize('0', 2);
                                var randomkey2 = randomize('0', 3);
                                var agentData = {
                                    "userId": agentUserId,
                                    "refferalCode": randomkey1 + agentUserId + randomkey2,
                                    "createdBy": 1,
                                    "updatedOn": dateymd
                                };
                                sharemodel.dbinsert(agentTable, agentData);/*insert parent into profile table*/

                            }


                            if (req.body.userRole == '2') {   /*manager*/

                                /*insert manager user id into table*/
                                var managerUserId = data.insertId;
                                var managerTable = "managerProfile";/*insert table*/
                                var managerData = {
                                    "userId": managerUserId,
                                    "updatedOn":dateymd
                                };
                                sharemodel.dbinsert(managerTable, managerData);/*insert manager into profile table*/

                            }

                           /*get admin email*/
                            sharemodel.getadminemail()
                            .then(function (adminemailres) {

                                var adminemail = adminemailres[0].Email;
                                var emailfrom = adminemail;
                                var emailto = req.body.Email;
                                var baseurl = shared.getbaseurl();
                                /*send email*/
                                shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/

                                /*response*/
                                callback(200, "Successfully Added New "+userRoleLabel);

                            })
                            .catch(function (err) {

                                console.log(err);
                               
                                /*response*/
                                 callback(0, "Failed To Add");

                            });


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


/*manager - agent - user - details*/
router.post('/manager-agent-user-details', function(req, res){

    const callback = function(status, message, details){

        res.json({"status": status, "message": message, "details":details});

    }

    if(req.body.uniqueUserId=="") {

          callback(0, "User Id Should Not Be Empty !","");

    } else if(req.body.requestUniqueUserId=="") {

          callback(0, "Request User Id Should Not Be Empty !","");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                console.log(data);

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');


                    if (userRole === 1 || userRole === 2) { /*if superadmin OR manager*/

                        sharemodel.dbGetUserIdfromUuid(req.body.requestUniqueUserId)

                        .then(function (userData) {

                            if (userData.length > 0) {


                                var user_Id = userData[0].userId;

                                adminusermodel.getManagerAgentUserDetails(user_Id)

                                .then(function (userDetails) {

                                    callback(200, "Success", userDetails[0]);

                                })
                                .catch(function (err) {

                                    console.log(err);
                                    callback(0, "Failed To Get Details !", "");

                                });



                            }  else {

                                callback(0, "Invalid User !", "");

                            }


                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Get Details !");

                        });
                    

                    }  else {

                        callback(0, "Invalid Admin Role !", "");

                    }

                   
                } else {

                    callback(0, "Invalid Admin User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Get Details !");

            });
    }

});




/*edit agent or manager user*/
router.post('/editmanageragentuser', function (req, res) {

    var dt = datetime.create();

    var dateymd = dt.format('Y-m-d H:M:S');


    const callback = function (status, message) {
        res.status = status;
        res.json({"status": status, "message": message});
    };
   

    if ( req.body.uniqueUserId === "") {

        callback(0, "User Id Should Not Be Empty !");

    } else if (req.body.Fname === "") {

        callback(0, "Fname Should Not Be Empty !");

    } else if (req.body.Lname === "") {

        callback(0, "Lname Should Not Be Empty !");

    } else if (req.body.Phone === "") {

        callback(0, "Phone Should Not Be Empty !");

    }  else if (req.body.Email === "") {

        callback(0, "Email Should Not Be Empty !");

    } else if (!emailvalidator.validate(req.body.Email)) {/*check email format*/

        callback(4, "Invalid Email Format!");

    } else if (req.body.Address === "") {

        callback(0, "Address Should Not Be Empty !");

    } else if (req.body.Pincode === "") {

        callback(0, "Pincode Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (userData) {

            if (userData.length > 0) {

                var userId = userData[0].userId;

                var promises = [];/*array for handling multiple query results*/

                promises[0] = commonmodel.emailExistsForOthersCheck(userId, req.body.Email);

                promises[1] = commonmodel.phoneExistsForOthersCheck(userId, req.body.Phone);

                Promise.all(promises).then(function (data) {

                    var emailData = data[0];

                    var phoneData = data[1];

                   if (phoneData.length > 0 && emailData.length > 0) {

                        callback(0, "Phone & Email Already Exists For Other User !");

                    } else if (phoneData.length > 0) {

                        callback(0, "Phone Already Exists For Other User !");

                    } else if(emailData.length > 0){ /* email alreday exists*/

                        callback(0, "Email Already Exists For Other User !");

                    } else {

                        var updateTable = "users";

                        var updateData = {

                            "nickName": req.body.Fname,

                            "Fname": req.body.Fname,

                            "Lname": req.body.Lname, 

                            "Phone": req.body.Phone,

                            "Email": req.body.Email,

                            "Address": req.body.Address,

                            "Pincode": req.body.Pincode,

                            "updatedOn":dateymd
                        };

                        var userCondition = { "userId": userId };

                        sharemodel.dbupdate(updateTable, updateData, userCondition)
                        .then(function () { 

                            callback(200, "Successfully Updated !");

                        })
                        .catch(function(err){

                            callback(0, "Updation Failed !");

                        });

                    }

                });

            } else {

                callback(0, "Invalid User !");
            }


        })
        .catch(function(err){

            callback(0, "Request Failed !");

        });



        
    }

});


 

/*all users list*/
router.post('/alluserslist', function(req, res){

	const callback = function(status, message, details){

		res.json({"status": status, "message": message, "details":details});

	}

	if(req.body.uniqueUserId=="") {

		  callback(0, "User Id Should Not Be Empty !","");

	} else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');


                    if (userRole === 1) { /*if superadmin*/
                     	 
	                    adminusermodel.dbgetallusers()

                        .then(function (userslist) {

                            callback(200, "Success", userslist);

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Get Details !");

                        });

                    }  else {

	                    callback(0, "You Have No Permission To Access  !", "");

	                }

                   
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Get Details !");

            });
    }

});



/*users list by user roles*/
router.post('/userslistbyuserrole', function(req, res){

	const callback = function(status, message, details){

		res.json({"status": status, "message": message, "details":details});

	}

	if(req.body.uniqueUserId=="") {

		  callback(0, "User Id Should Not Be Empty !","");

	} else if(req.body.requestUserRole=="") {

		  callback(0, "User Role Should Not Be Empty !","");

	} else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');


                    if (userRole === 1) { /*if superadmin*/


                        if(req.body.requestUserRole==="all"){


                            adminusermodel.dbgetallusers()

                            .then(function (userslist) {

                                callback(200, "Success", userslist);

                            })
                            .catch(function (err) {

                                console.log(err);
                                callback(0, "Failed To Get Details !");

                            });

                        } else {

                             adminusermodel.dbGetUsersByRoles(req.body.requestUserRole)

                            .then(function (userslist) {

                                callback(200, "Success", userslist);

                            })
                            .catch(function (err) {

                                console.log(err);
                                callback(0, "Failed To Get Details !");

                            });

                        }
                     	 
	                   

                    }  else {

	                    callback(0, "You Have No Permission To Access  !", "");

	                }

                   
                } else {

                    callback(0, "Invalid User !", "");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Get Details !");

            });
    }

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

     } else if(req.body.teacherUniqueUserId == ""){

        callback(0, "Teacher User Id Should Not Be Empty !", "", "", "", "");

     }  else {

          sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (userData) {

                if (userData.length > 0) {

                	var userRole = userData[0].userRole;

                	if (userRole === 1 || userRole === 2 || userRole === 3) { /*if superadmin OR manager OR agent*/

						sharemodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId)
			            .then(function (data) {
			            
			           		if (data.length > 0) {

			                    var teacherUserId = data[0].userId;

			                    var userTeacherRole = data[0].userRole;

                				if (userTeacherRole === 4) { /*if teacher*/

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

                					callback(0,"Invalid Teacher Role !", "", "", "", "", 404);/*response with 404 header status*/

                				}

			                    

		                    } else {

		                   		 callback(0,"Invalid Teacher User !", "", "", "", "", 404);/*response with 404 header status*/

		                	}

	            	 	})
	                    .catch(function(err){

	                         console.log(err);
	                         callback(0, "Failed To Get Details !", "", "", "", "");

	                    });


                	} else {

                		callback(0, "Invalid Role Entry!", "", "", "", "");

                	} 

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





/*student profile details*/
router.post('/studentprofiledetails',function(req, res){

    const callback = function(status, message, profileDetails, studentCourses, profileStrength, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "studentCourses":studentCourses, "profileStrength": profileStrength});
    }

    if(req.body.uniqueUserId == ""){

	    callback(0, "User Id Should Not Be Empty !", "", "", "", "");

	} else if(req.body.studentUniqueUserId == ""){

	    callback(0, "Student User Id Should Not Be Empty !", "", "", "", "");

	}  else {

       sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (userData) {

                if (userData.length > 0) {

                	var userRole = userData[0].userRole;

                	if (userRole === 1) { /*if superadmin*/

						sharemodel.dbGetUserIdfromUuid(req.body.studentUniqueUserId)
			            .then(function (data) {
			            
			           		if (data.length > 0) {

			           			var userStudentRole = data[0].userRole;

                				if (userStudentRole === 6) { /*if student*/

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

                					 callback(0,"Invalid Student Role !", "", "", "", "", 404);/*response with 404 header status*/

                				}
			           		
		                    } else {

		                   		 callback(0,"Invalid Student User !", "", "", "", "", 404);/*response with 404 header status*/

		                	}


		                })
	                    .catch(function(err){

	                         console.log(err);
	                         callback(0, "Failed To Get Details !", "", "", "", "");

	                    });


                	} else {

                		callback(0, "Invalid Role Entry!", "", "", "", "");

                	} 

                } else {

                    callback(0,"Invalid User !", "", "", "", "", 404);/*response with 404 header status*/

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Failed To Get Details !", "", "", "");

            });
     }

});



/*parent profile details*/
router.post('/parentprofiledetails', function(req, res){

    const callback = function(status, message, profileDetails, parentStudents, profileStrength, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "parentStudents":parentStudents, "profileStrength": profileStrength});
    } 

     if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "", "", "");

     } else if(req.body.parentUniqueUserId == ""){

	    callback(0, "Parent User Id Should Not Be Empty !", "", "", "", "");

	}  else {

     	 sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (userData) {

                if (userData.length > 0) {

                	var userRole = userData[0].userRole;

                	if (userRole === 1) { /*if superadmin*/

						sharemodel.dbGetUserIdfromUuid(req.body.parentUniqueUserId)
			            .then(function (data) {
			            
			           		if (data.length > 0) {

			           			var userParentRole = data[0].userRole;

                				if (userParentRole === 5) { /*if parent*/

                					var parentUserId = data[0].userId;

						            var promises = [];

						            promises[0] = parentmodel.getParentProfileDetails(parentUserId);

						            promises[1] = parentmodel.getParentStudents(parentUserId);

						            Promise.all(promises).then(function(parentData){

						                //console.log(parentData);

						                var parentProfile = parentData[0][0];

						                var parentStudents = parentData[1];

						                /*calculate profile strength - start*/
						                var profileStrength = 60;

						                if(parentProfile['emailVerified']==1) {

						                    profileStrength += 5;
						                }

						                if(parentProfile['profilePic']!="") {

						                    profileStrength += 5;
						                }

						                if(parentProfile['Pincode']!="") {

						                    profileStrength += 5;
						                }

						                if(parentStudents.length>0) {

						                    profileStrength += 5;
						                }
						                /*calculate profile strength - end*/


						                if(parentStudents.length>0){ /*if parent students not empty*/

						                    var i=1; /*loop counter*/

						                    /*loop parent students*/
						                    parentStudents.forEach( function( item, index, array) { 

						                        var parentStudentId = item.parentStudentId;

						                        parentmodel.getParentStudentCourses(parentStudentId) /*get parent-students courses*/

						                        .then(function(parentStudentCourses){

						                            item.parentStudentCourses = parentStudentCourses; /*push parent-student courses into parent-student array(item)*/

						                            console.log("counter :"+ i + ", lenth :"+parentStudents.length);

						                            if(i==parentStudents.length)
						                            {

						                                callback(200, "Success", parentProfile, parentStudents, profileStrength); /*call back with parent students courses*/

						                            }

						                            i+=1; /*counter increment*/


						                        })
						                        .catch(function(err){

						                            console.log(err);

						                        });

						                    });

						                } else {

						                    callback(200, "Success", parentProfile, parentStudents, profileStrength); 

						                }


						            })
						            .catch(function(err){

						                 console.log(err);
						                 callback(0, "Failed To Get Details !", "", "", "");

						            });



                				} else {

                					callback(0, "Invalid Parent User Role !", "", "", "", "");/*response with 401 header status*/

                				}

                			} else {

                				callback(0, "Invalid Parent User !", "", "", "", 401);/*response with 401 header status*/
                					
                			}
                		})
                		.catch(function(err){

                         	console.log(err);
                         	callback(0, "Failed To Get Details !", "", "", "");

                    	});

 					} else {

                		callback(0, "Invalid User Role Entry !", "", "", "", 401);/*response with 401 header status*/
                					
                	}

				} else {

            		callback(0, "Invalid User !", "", "", "", 401);/*response with 401 header status*/
            					
            	}

            })
    		.catch(function(err){

             	console.log(err);
             	callback(0, "Failed To Get Details !", "", "", "");

        	});

     }

});



/*user update : status*/
router.post('/userstatusupdate', function (req, res) {
    
    
    const callback = function (status, message) {

        res.json({"status": status, "message": message});

    };


    if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "", "", "");

     } else if(req.body.updateUniqueUserId == ""){

	    callback(0, "Status Update User Id Should Not Be Empty !", "", "", "", "");

	} else if(req.body.statusFlag == ""){

	    callback(0, "Status Should Not Be Empty !", "", "", "", "");

	}  else if(req.body.statusFlag != 1 && req.body.statusFlag != 0 ){

	    callback(0, "Invalid Status. Status Should Be 1 OR 0  !", "", "", "", "");

	}   else {

    	sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

            	 var adminUserRole = adminData[0].userRole;

            	 if (adminUserRole === 1) { /*if superadmin*/

			    	sharemodel.dbGetUserIdfromUuid(req.body.updateUniqueUserId) /*get userid from uniqueserid*/
			        .then(function (data) {

			            if (data.length > 0) {

							var dt = datetime.create();

							var dateymd = dt.format('Y-m-d H:M:S');

				            var userId = data[0].userId;

				            var table = "users";

				            var updatedata = {
				                "Status": req.body.statusFlag,
				                "updatedOn": dateymd
				            };

				            var condition = { "userId": userId };

				            sharemodel.dbupdate(table, updatedata, condition)
				            .then(function () {

				                callback(200, "User Status Updated Successfully");

				            })
				            .catch(function (error) {

				                console.log(error);
				                callback(0, "Failed to Update User Status !");

				            });


			            } else {

			                callback(0, "Invalid Status Update User !");

			            }
		            })
		            .catch(function (error) {

		                console.log(error);
		                callback(0, "Failed to Update User Status !");

		            });



            	 } else {

                	callback(0, "Invalid User Role Entry !");/*response with 401 header status*/

            	 }



            } else {

                callback(0, "Invalid User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed to Update User Status !");

        });

    }

});





/*user delete profile*/
router.post('/useraccountremove',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.removeUniqueUserId == ""){

	    callback(0, "Remove User Id Should Not Be Empty !");

	} else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

            	 var adminUserRole = adminData[0].userRole;

            	 if (adminUserRole === 1) { /*if superadmin*/

			    	sharemodel.dbGetUserIdfromUuid(req.body.removeUniqueUserId) /*get userid from uniqueserid*/
			        .then(function (data) {

			            if (data.length > 0) {

			            	var userId = data[0].userId;

				            var userRole = data[0].userRole;

				            var dt = datetime.create();

				            var dateymd = dt.format('Y-m-d H:M:S');

				            /*Keep Backup Deleting User*/
				            commonmodel.keepBackupDeletingUser(userId)
				            .then(function(backupResult){

				                /*remove user*/
				                var table = "users";

				                var condition = {"userId" : userId};

				                 sharemodel.dbremove(table, condition)
				                .then(function () {

				                    callback(200, "Account Removed");

				                })
				                .catch(function (error) {

				                    console.log(error);
				                    callback(0, "Failed to Remove !");

				                });


				            })
				            .catch(function(err)
				            {
				                    
				                console.log(err);
				                callback(0, "Failed to Remove !");

				            });

			           	} else {

			                callback(0, "Invalid Remove User !");

			            }
		            })
		            .catch(function (error) {

		                console.log(error);
		                callback(0, "Failed to Remove Account !");

		            });



            	} else {

                	callback(0, "Invalid User Role Entry !");/*response with 401 header status*/

            	}


            } else {

                callback(0, "Invalid User !");

            }
        })
  		.catch(function (error) {

            console.log(error);
		    callback(0, "Failed to Remove Account !");

        });
  
    }

}); 



/*admin-report-statistics-add-query*/
router.post('/admin-report-statistics-add-query',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    var lowerQuery = req.body.Query.toLowerCase();

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.Title == ""){

        callback(0, "Title Should Not Be Empty !");

    } else if(req.body.Query == ""){

        callback(0, "Query Should Not Be Empty !");

    } else if (lowerQuery.indexOf("create ") != -1 || lowerQuery.indexOf("alter ") != -1 || lowerQuery.indexOf("drop ") != -1 || lowerQuery.indexOf("insert ") != -1 || lowerQuery.indexOf("update ") != -1 || lowerQuery.indexOf("delete ") != -1 || lowerQuery.indexOf("truncate ") != -1 ) { 

        callback(0, "CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE Statements Should Not Be Allowed On Query !");

    } else if(req.body.queryType == ""){

        callback(0, "Type Should Not Be Empty !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var InsertData = {

                        "Title" : req.body.Title,

                        "Query" : req.body.Query,

                        "queryType" : req.body.queryType,

                        "createdBy" : adminUserId,

                        "updatedOn" : dateymd

                     };

                    /*Insert Query*/
                    sharemodel.dbinsert(table,InsertData)
                    .then(function(){

                        callback(200, "Successfully Added");
 
                    })
                    .catch(function (error) {

                        console.log(error);
                        callback(0, "Failed to Add !");

                    });



                } else {

                    callback(0, "Invalid User Role Entry !");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed to Add !");

        });
  
    }

});



/*admin-report-statistics-edit-query*/
router.post('/admin-report-statistics-edit-query',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    var lowerQuery = req.body.Query.toLowerCase();

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.Title == ""){

        callback(0, "Title Should Not Be Empty !");

    } else if(req.body.queryId == ""){

        callback(0, "Query Id Should Not Be Empty !");

    } else if(req.body.Query == ""){

        callback(0, "Query Should Not Be Empty !");

    } else if (lowerQuery.indexOf("create ") != -1 || lowerQuery.indexOf("alter ") != -1 || lowerQuery.indexOf("drop ") != -1 || lowerQuery.indexOf("insert ") != -1 || lowerQuery.indexOf("update ") != -1 || lowerQuery.indexOf("delete ") != -1 || lowerQuery.indexOf("truncate ") != -1 ) { 

        callback(0, "CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, TRUNCATE Statements Should Not Be Allowed On Query !");

    } else if(req.body.queryType == ""){

        callback(0, "Type Should Not Be Empty !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var updateData = {

                        "Title" : req.body.Title,

                        "Query" : req.body.Query,

                        "queryType" : req.body.queryType,

                        "createdBy" : adminUserId,

                        "updatedOn" : dateymd

                     };

                     var updateCondition = {"queryId":req.body.queryId};

                    /*Update Query*/
                    sharemodel.dbupdate(table, updateData, updateCondition)
                    .then(function(){

                        callback(200, "Successfully Updated");
 
                    })
                    .catch(function (error) { 

                        console.log(error);
                        callback(0, "Failed to Update !");

                    });


                } else {

                    callback(0, "Invalid User Role Entry !");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed to Update !");

        });
  
    }

}); 



/*admin-statistics-report-list-query*/
router.post('/admin-report-statistics-list-query',function(req, res){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } if(req.body.queryType==""){

         callback(0,"Query Type Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var fields= ["queryId", "Title", "Query", "queryType", "createdBy", "updatedOn", "createdOn"];

                    var getCondition = {"queryType":req.body.queryType};

                    /*get Queries*/
                    sharemodel.dbgetdetails(fields, table, getCondition)
                    .then(function(Queries){

                        callback(200, "Success", Queries);
 
                    })
                    .catch(function (error) { 

                        console.log(error);
                        callback(0, "Failed !", "");

                    });


                } else {

                    callback(0, "Invalid User Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed !", "");

        });
  
    }

}); 



/*admin-statistics-report-query-details*/
router.post('/admin-report-statistics-query-details',function(req, res){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } if(req.body.queryId==""){

         callback(0,"Query Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var fields= ["queryId", "Title", "Query", "queryType", "createdBy", "updatedOn", "createdOn"];

                    var getCondition = {"queryId":req.body.queryId};

                    /*get Queries*/
                    sharemodel.dbgetdetails(fields, table, getCondition)
                    .then(function(Query){

                        if(Query.length > 0){

                            callback(200, "Success", Query[0]);
         
                        } else {

                           callback(0, "Invalid Query Id !", "");

                        }

                    })
                    .catch(function (error) { 

                        console.log(error);
                        callback(0, "Request Failed !", "");

                    });


                } else {

                    callback(0, "Invalid User Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed !", "");

        });
  
    }

}); 



/*admin-statistics-report-execute-query*/
router.post('/admin-report-statistics-execute-query',function(req, res){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } if(req.body.queryId==""){

         callback(0,"Query Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var fields= ["queryId", "Title", "Query", "createdBy", "updatedOn", "createdOn"];

                    var getCondition = {"queryId":req.body.queryId};

                    /*get Queries*/
                    sharemodel.dbgetdetails(fields, table, getCondition)
                    .then(function(Query){

                        if(Query.length > 0){

                            var sqlQuery = Query[0].Query;

                            /*execute queries*/
                            adminusermodel.executeAdminQueries(sqlQuery)
                            .then(function(results){

                                callback(200, "Success", results);
         
                            })
                            .catch(function (error) { 

                                console.log(error);
                                callback(0, "Request Failed !", "");

                            });


                        } else {

                           callback(0, "Invalid Query Id !", "");

                        }


  
                    })
                    .catch(function (error) { 

                        console.log(error);
                        callback(0, "Request Failed !", "");

                    });

                   


                } else {

                    callback(0, "Invalid User Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed !", "");

        });
  
    }

}); 




/*admin-statistics-report-remove-query*/
router.post('/admin-report-statistics-remove-query',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.queryId==""){

         callback(0,"Query Id Should Not Be Empty !");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var table = "reportgeneratequery";

                    var fields= ["queryId", "Title", "Query", "createdBy", "updatedOn", "createdOn"];

                    var getCondition = {"queryId":req.body.queryId};

                    /*get Queries*/
                    sharemodel.dbgetdetails(fields, table, getCondition)
                    .then(function(Query){

                        if(Query.length > 0){

                            var table = "reportgeneratequery";

                            var removeCondition = {"queryId":req.body.queryId};

                            /*remove query*/
                            sharemodel.dbremove(table, removeCondition)
                            .then(function(results){

                                callback(200, "Successfully Removed");
         
                            })
                            .catch(function (error) { 

                                console.log(error);
                                callback(0, "Request Failed !");

                            });


                        } else {

                           callback(0, "Invalid Query Id !");

                        }


  
                    })
                    .catch(function (error) { 

                        console.log(error);
                        callback(0, "Request Failed !");

                    });


                } else {

                    callback(0, "Invalid User Role Entry !");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed !");

        });
  
    }

}); 





/*admin-statistics*/
router.post('/admin-statistics-overview',function(req, res){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

 
    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*get userid from uniqueserid*/
        .then(function (adminData) {

            if (adminData.length > 0) {

                var adminUserId = adminData[0].userId;

                var adminUserRole = adminData[0].userRole;

                if (adminUserRole === 1) { /*if superadmin*/

                    var dt = datetime.create();

                    var date_ymd = dt.format('Y-m-d');

                    var promises = [];/*array for handling multiple query results*/

                    promises[0] = adminusermodel.getTotalUserCountByRole(4);/*total teachers*/

                    promises[1] = adminusermodel.getTotalUserCountByRole(6);/*total students*/

                    promises[2] = adminusermodel.getTotalUserCountByRole(5);/*total parents*/

                    promises[3] = adminusermodel.totalRegistrationToday(date_ymd);/*total Registration Today*/

                    promises[4] = adminusermodel.totalLoginToday(date_ymd);/*total login Today*/

                    Promise.all(promises).then(function (data) {

                        var results = {

                            "totalTeachers" : data[0][0].totalUsers,
                            "totalStudents" : data[1][0].totalUsers,
                            "totalParents" : data[2][0].totalUsers,
                            "totalRegistrationToday" : data[3][0].totalRegistrationToday,
                            "totalLoginToday" : data[4][0].totalLoginToday

                        };

                        callback(200, "Success", results);

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0, "Failed !", "");/*response*/


                    });

 

                } else {

                    callback(0, "Invalid User Role Entry !", "");/*response with 401 header status*/

                }


            } else {

                callback(0, "Invalid User !", "");

            }
        })
        .catch(function (error) {

            console.log(error);
            callback(0, "Failed !", "");

        });
  
    }

}); 






module.exports = router;
