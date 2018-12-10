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
var agentmodel = require('../../models/admin/agentmodule');
var datetime = require("node-datetime");
var randomize = require("randomatic");
var adminusermodel = require('../../models/admin/usermodule');
var emailvalidator = require('email-validator'); 
var bcryptnodejs = require('bcrypt-nodejs');
var shared = require('../shared/shared');
var uuidv4 = require('uuid/v4');
var uniqid = require('uniqid');
var trim = require('trim');
var split = require('split-string');



/*agent-add-teacher*/
router.post('/agent-add-teacher',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

 
    if(req.body.agentUniqueUserId==""){

         callback(0,"Agent User Id Should Not Be Empty !");

    }  else if(req.body.Fname==""){

         callback(0,"First Name Should Not Be Empty !");

    } else if(req.body.Lname==""){

         callback(0,"Last Name Should Not Be Empty !");

    } else if(req.body.Phone==""){

         callback(0,"Teacher Phone Should Not Be Empty !");

    } else if(req.body.Email==""){

         callback(0,"Teacher Email Should Not Be Empty !");

    } else if(req.body.tuitionCenterName==""){

         callback(0,"Tuition Center Name Should Not Be Empty !");

    }  else if(req.body.Pincode==""){

         callback(0,"Pincode Should Not Be Empty !");

    }  else {

        sharemodel.dbGetUserIdfromUuid(req.body.agentUniqueUserId) /*get userid from uniqueserid*/
        .then(function (agentData) {

            if (agentData.length > 0) {
                
                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var autoPassword = randomize('A0', 10);

                var passwordHash = bcryptnodejs.hashSync(autoPassword);

                var userToken = uuidv4();

                var uniqueUserId = uniqid();

                var agentUserId = agentData[0].userId;

                var agentUserRole = agentData[0].userRole;

                var senderName = agentData[0].Fname+' '+agentData[0].Lname;

                if (agentUserRole === 3) { /*if agent*/

                    var promises = [];/*array for handling multiple query results*/

                    promises[0] = usermodel.emailexistcheck(req.body.Email);

                    promises[1] = usermodel.phoneexistcheck(req.body.Phone);

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

                            var userTable = "users";

                            var userData = {

                                "uniqueUserId": uniqueUserId,

                                "nickName": req.body.Fname,

                                "Fname": req.body.Fname,

                                "Lname": req.body.Lname,

                                "Phone": req.body.Phone,

                                "Email": req.body.Email,

                                "Password": passwordHash,

                                "userToken": userToken,

                                "userRole": 4,

                                "phoneVerified":0,

                                "emailVerified":0,

                                "Pincode": req.body.Pincode,

                                "Status":1,

                                "createdOn":dateymd,

                                "updatedOn":dateymd
                            };

                             /* insert teacher user */
                            sharemodel.dbinsert(userTable, userData)
                            .then(function (teacherData) { 

                                console.log(teacherData);

                                /*insert teacher-tuition center into table*/
                                var teacherUserId = teacherData.insertId; 

                                var tuitionTable = "tuitioncenters";/*insert table*/

                                var tuitionData = {
                                    "teacherUserId": teacherUserId,
                                    "tuitionCenterName" : req.body.tuitionCenterName
                                };

                                sharemodel.dbinsert(tuitionTable, tuitionData);/*insert teacher-tuition center into table*/

                                /* teacher profile insert */
                                var randomkey1 = randomize('0', 2);

                                var randomkey2 = randomize('0', 3);

                                var nickName = req.body.Fname;

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



                                /*agent teacher insertion*/
                                var table = "agentTeachers";

                                var insertData= {

                                    "agentUserID":agentUserId,
                                    "teacherUserId":teacherUserId ,
                                    "agentComment":req.body.agentComment,
                                    "joinStatus": '0',
                                    "managerStatus":'1',
                                    "updatedOn":dateymd

                                 };


                                /*insert agent teacher*/
                                sharemodel.dbinsert(table, insertData)
                                .then(function(){

                                    /*get admin email*/
                                    sharemodel.getadminemail()
                                    .then(function (adminemailres) {
                                        var adminemail = adminemailres[0].Email;
                                        var emailfrom = adminemail;
                                        var emailto = req.body.Email;
                                        var subject = 'GoTuition : '+senderName+' Added You As A Teacher';

                                        /*email message*/
                                        var baseurl = shared.getbaseurl();

                                        var loginUrl = baseurl+'/login/';

                                        /* emailmessage */
                                        var emailmessage = '<strong> Hi, '+req.body.Fname+'</strong><br>';

                                        emailmessage += '<br>';

                                        emailmessage += 'Please Login Here: ' + loginUrl;

                                        emailmessage += '<br>';

                                        emailmessage += 'Username: ' + req.body.Email;

                                        emailmessage += '<br>';

                                        emailmessage += 'Password: ' + autoPassword;

                                        emailmessage += '<br>';

                                        emailmessage += '<br>';  

                                        emailmessage += '<br>';
                                         
                                        /*send email*/
                                        shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/

                                        /*response*/
                                        callback(200, "Successfully Added !");


                                    })
                                    .catch(function (err) {
                                        
                                        console.log(err);
                                        callback(0, "Request Failed !");

                                    });


                                })
                                .catch(function (error) { 

                                    console.log(error);
                                    callback(0, "Request Failed !");

                                });

 
                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0, "Updation Failed !");

                            });

                        }

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
            callback(0, "Request Failed !");

        });
  
    }

}); 




/*get-agent-added-teachers*/
router.post('/agent-teachers-list',function(req, res, details){ 

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details" : details});
    }

 
    if(req.body.agentUniqueUserId==""){

         callback(0,"Agent User Id Should Not Be Empty !", "");

    } else {

        sharemodel.dbGetUserIdfromUuid(req.body.agentUniqueUserId) /*get userid from uniqueserid*/
        .then(function (agentData) {

            if (agentData.length > 0) {

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var agentUserId = agentData[0].userId;

                var agentUserRole = agentData[0].userRole;

 
                if (agentUserRole === 3) { /*if agent*/

                       agentmodel.getAgentTeachersList(agentUserId) /*get Agent Teachers List*/
                         .then(function (agentTeachers) {

                             callback(200, "Success", agentTeachers);

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
            callback(0, "Request Failed !", "");

        });
  
    }

}); 






module.exports = router;
