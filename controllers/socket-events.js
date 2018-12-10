
var chatModel = require('../models/chatmodel');
var sharedmodel = require('../models/shared/shared');
var datetime = require("node-datetime");
var formidable = require('formidable');
var _ = require('lodash');
var fs = require('fs');
var util = require('util')
var shared = require('./shared/shared');





var users = [];


exports = module.exports = function (io) {

  io.on('connection', (socket) => {

    console.log(socket.id + ' : connected...'); 

   

    /* Listen when a user is online : update online status to DB */
    socket.on("iamOnline", (onlineData) => {

      console.log("iamOnline :"+onlineData.uniqueUserId);

      var userTable = "users";

      var userOnlineUpdateData = {"chatOnlineStatus" : "1" , "chatSocketId":socket.id};

      var onlineUpdateCondition = {"uniqueUserId" : onlineData.uniqueUserId};

      sharedmodel.dbupdate(userTable, userOnlineUpdateData, onlineUpdateCondition) /* update online status */
      .then(function(){

         /* emit when new user in online */
         socket.broadcast.emit('onlineUsersListUpdated',"iamOnline"); 
      });



    });



     /* method return users from mysql db */
      function getChatUsers(reqData) {

          const callback = function (status, message, details, parentStudents) {

            console.log(message);

             console.log(details);

            var resData = { "status": status, "message": message, "details": details, "parentStudents" : parentStudents };

            socket.emit('usersList', resData);

          };

          sharedmodel.dbGetUserIdfromUuid(reqData.uniqueUserId) /*get userid from uniqueserid*/
          .then(function (data) {

              if (data.length > 0) {

                 console.log(3);

                  var userId = data[0].userId;

                  var userRole = data[0].userRole;

                  console.log(userRole);

                  if(userRole==4){ /*Teacher*/

                     /*get Teacher Chat Users*/
                      chatModel.getTeacherChatUsers(userId)
                      .then((data) => {

                            console.log(data);

                            callback(200, "Success", data, []);/*response*/

                      })
                      .catch((err) => {

                        console.log(err);

                        callback(0, "Request Failed !", [], []);/*response*/

                      });

                  } else { /*Parent or Student*/

                    console.log('Parent or Student');

                      /*get Parent or Student Chat Users*/
                      chatModel.getParentStudentChatUsers(userId)
                      .then((data) => {

                          console.log(data);

                          if(userRole==5){ /*If Current User is Parent*/

                            chatModel.getParentStudents(userId) /*get current Parent's Students*/
                            .then(function(parentStudents){

                              if(parentStudents.length>0){ /*if parent students not empty*/

                                  var i=1; /*loop counter*/

                                  /*loop parent students*/
                                  parentStudents.forEach( function( item, index, array) { 

                                      var parentStudentId = item.parentStudentId;

                                      chatModel.getParentStudentCourses(parentStudentId) /*get parent-students courses*/

                                      .then(function(parentStudentCourses){

                                          item.parentStudentCourses = parentStudentCourses; /*push parent-student courses into parent-student array(item)*/

 
                                          if(i==parentStudents.length) /*last loop*/
                                          {

                                              callback(200, "Success", data, parentStudents); /*call back with parent students courses*/

                                          }

                                          i+=1; /*counter increment*/


                                      })
                                      .catch(function(err){

                                          console.log(err);

                                      });

                                  });

                              } else {

                                  callback(200, "Success", data, []);/*parent - response*/

                              }
 
                            })
                            .catch(function(err){

                              console.log(err);

                            });

                          } else {

                            //console.log(data);
                            callback(200, "Success", data, []);/*response*/


                          }

                      })
                      .catch((err) => {

                        console.log(err);

                        callback(0, "Request Failed !", [], []);/*response*/

                      });

                  }
                 
              } else {

                  console.log("Invalid User !");

                  callback(0, "Invalid User !", [], []);/*response*/

              }
          })
          .catch(function(err){

            console.log(err);

             callback(0, "Request Failed !", [], []);/*response*/

          });

      }


    

    /* create a chat room for both users */
    socket.on('myChatRoom', (roomDetails) => {

      console.log('my chat room');


      const callback = function (status, chatRoomId) {

          console.log(chatRoomId);

          socket.emit("chatRoomId", chatRoomId);
        };

        sharedmodel.dbGetUserIdfromUuid(roomDetails.teacherUniqueUserId) /*check teacher user from uniqueserid*/
        .then(function (teacherData) {

          if (teacherData.length > 0) {

 
            sharedmodel.dbGetUserIdfromUuid(roomDetails.userUniqueUserId) /*check peer user from uniqueserid*/
            .then(function (userData) {

                if (userData.length > 0) {


                  var chatRoomId = roomDetails.teacherUniqueUserId+roomDetails.userUniqueUserId; /* room id by teacher unique user id and user unique user id */
             
                  socket.join(chatRoomId, function () {

                    callback(200, chatRoomId);/*response*/

                  });


                } else {

                      console.log("Invalid User !");

                      callback(0, "Invalid User !", "");/*response*/

                }

              })
              .catch(function(err){

                console.log(err);

                callback(0, "Request Failed !", "");/*response*/

              });

            } else {

                console.log("Invalid Teacher User !");

                callback(0, "Invalid Teacher User !", "");/*response*/

            }
        })
        .catch(function(err){

          console.log(err);

           callback(0, "Request Failed !", "");/*response*/

        });

    });


    /* my Chat Room Details*/
    socket.on('myChatRoomDetails', (roomDetails) => {

    console.log('myChatRoomDetails');

      const callback = function (status, chatRoomId, myChat) {

          console.log(chatRoomId);

          console.log(myChat);

          var resData = { "status": status, "chatRoomId": chatRoomId, 'myChat':myChat};

          socket.emit('chatRoomDetails', resData);

        };

      sharedmodel.dbGetUserIdfromUuid(roomDetails.currentUniqueUserId) /*get current userid from uniqueserid*/
      .then(function (userData) {

          if (userData.length > 0) {


            var userId =  userData[0].userId;

            if(roomDetails.currentUniqueUserId == roomDetails.teacherUniqueUserId){

              var peerUniqueUserId = roomDetails.userUniqueUserId ;

            } else if(roomDetails.currentUniqueUserId == roomDetails.userUniqueUserId){

              var peerUniqueUserId = roomDetails.teacherUniqueUserId ;

            }


            sharedmodel.dbGetUserIdfromUuid(peerUniqueUserId) /*get peer userId from uniqueserid*/
            .then(function (peerUserData) {

                if (peerUserData.length > 0) {

                  var chatRoomId = roomDetails.teacherUniqueUserId + roomDetails.userUniqueUserId; /* room id by teacher unique user id and user unique user id */

                  var chatTable = "userchats";

                  var chatUpdateData = {'chatStatus':'read'};

                  var chatUpdateCondition = "receiverUserId = "+ userId +" AND chatStatus = 'unread'";

                  sharedmodel.dbupdate(chatTable, chatUpdateData, chatUpdateCondition) /*update all unread messages to read*/
                  .then(function(){

                    chatModel.getMyChatRoomDetails(userId, chatRoomId) /*get my Chat Room Details*/
                    .then((myChat) => {

                        if (myChat.length > 0) {
               
                          callback(200, chatRoomId, myChat);/*response*/
               
                        } else {
               
                          callback(200, chatRoomId, []);/*response*/
               
                        }

                      })
                      .catch(

                        (err) => { throw new Error(err); }

                      );

                  })
                  .catch(function(err){

                    console.log(err);


                  });

                 

                } else {

                  console.log("Invalid Peer User !");

                  callback(0, "Invalid Peer User !", "");/*response*/

               }
            })
            .catch(function(err){

              console.log(err);

              callback(0, "Request Failed !", "");/*response*/

            });

          } else {

              console.log("Invalid User !");

              callback(0, "Invalid User !", "");/*response*/

          }
      })
      .catch(function(err){

        console.log(err);

         callback(0, "Request Failed !", "");/*response*/

      });

    });



    /* receive message from user and send to peers */
    socket.on('receiveMessage', function (messageData, resCallbackFn) {

      console.log("message insertion");
      console.log(messageData);

       const callback = function (status, messageChatData) {/*call back fn.*/

          console.log(messageData.chatRoomId);

          var resData = { "status": status, "messageData": messageChatData };

          if(status===200)
          {

            resCallbackFn({ "status": status, "messageData": messageChatData.userChatId });/*function for message sender*/

          } else  if(status===0){

              resCallbackFn({ "status": status, "messageData": messageChatData });/*function for message sender*/


          }


          /* socket.to('room123').emit('new-message', data); */
          socket.broadcast.to(messageData.chatRoomId).emit('sendMessage', resData);

        };

        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        var dtnow = dt.now();


        sharedmodel.dbGetUserIdfromUuid(messageData.senderUniqueUserId) /*get sender userid from uniqueuserid*/
        .then(function (senderUserData) {

          if(senderUserData.length>0) {

             var senderUserId = senderUserData[0].userId;

             sharedmodel.dbGetUserIdfromUuid(messageData.receiverUniqueUserId) /*get receiver userid from uniqueserid*/
             .then(function (receiverUserData) {

             // console.log(receiverUserData);

                if(receiverUserData.length > 0) {

                  var receiverUserId = receiverUserData[0].userId;

                  /*chat table details*/
                  var chatTable="userchats";

                  if(messageData.chatType == 'text'){

                        var chatData={

                          "senderUserId":senderUserId,
                          "receiverUserId":receiverUserId,
                          "parentStudentId" : messageData.parentStudentId,/*have value only for parent peer*/
                          "roomId" : messageData.chatRoomId,
                          "chatMessage" : messageData.chatMessage,
                          "chatType" : messageData.chatType,
                          "chatAttachment" : messageData.chatAttachment,
                          "createdOn" : dateymd

                        };



                        sharedmodel.dbinsert(chatTable, chatData) /*insert my Chat Details*/
                        .then((myChat) => {

                            if(myChat.insertId!=""){

                              /*response data*/
                              var messageChatData = {  
                                    "roomId" : messageData.chatRoomId,
                                    "userChatId": myChat.insertId,
                                    "chatMessage": messageData.chatMessage,
                                    "chatAttachment": '',
                                    "chatType": messageData.chatType,
                                    "chatStatus": 'unread',
                                    "parentStudentId" : messageData.parentStudentId, /*have value only for parent peer*/
                                    "studentFname" : messageData.studentFname, /*have value only for parent peer*/
                                    "studentLname" : messageData.studentLname, /*have value only for parent peer*/ 
                                    "createdOn": dateymd
                                    
                              };
                   
                              callback(200, messageChatData);/*response*/

                            } else {

                              callback(0, "Request Failed !");/*response*/

                            }

                            

                        })
                        .catch(

                          (err) => { console.log(err); callback(0, 'Request Failed !');/*response*/ }

                        );

                  } else if(messageData.chatType == 'file') { /* chat attachment */

                       var removeString; 
                       
                       var extension;

                       var chatAttachment = messageData['chatAttachment'];

                       var chatFileName = messageData['chatFileName'];

                       var chatFileType = messageData['chatFileType'];

                       var chatFileSize = messageData['chatFileSize'];


                       console.log(chatFileName);  
                       console.log(chatFileType);      
                       console.log(chatFileSize);   

                      if(chatFileSize > 1000000) { /*allow only below 1MB files*/

                        console.log('allow only below 1MB files'); 

                         callback(0, "File Should Be Below 1MB !");/*response*/


                      } else if(chatFileType!="image/png" && chatFileType!="image/jpg" && chatFileType!="image/jpeg" && chatFileType!="image/gif" && chatFileType!="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && chatFileType!="application/vnd.openxmlformats-officedocument.wordprocessingml.document" && chatFileType!="application/pdf" && chatFileType!= "text/plain"){

                         callback(0, "Invalid File Format. Allowed Formats Are PNG, JPG, GIF, DOC, PDF, TXT, XLSX !");/*response*/

                      } else {

                          /** check file type and assign proper renove string from base64*/
                          if (chatFileType.indexOf("/png") != -1) { 

                            console.log('png'); 
                            extension = "png"; 
                            var removeString = 'data:image/png;base64,'; 

                          } else if(chatFileType.indexOf("/jpg") != -1 || chatFileType.indexOf("/jpeg") != -1) {

                            console.log('jpg'); 
                            extension = "jpg";  
                            var removeString = 'data:image/jpeg;base64,'; 


                          } else if(chatFileType.indexOf("/gif") != -1 ) {

                            console.log('gif'); 
                            extension = "gif"; 
                            var removeString = 'data:image/gif;base64,'; 

                          } else if(chatFileType.indexOf("/pdf") != -1 ) {

                            console.log('pdf'); 
                            extension = "pdf"; 
                             
                            var removeString = 'data:application/pdf;base64,'; 


                          } else if(chatFileType.indexOf(".document") != -1 ) {

                            console.log('doc'); 
                            extension = "doc"; 
                            var removeString = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,'; 

                          }  else if(chatFileType.indexOf("text") != -1) {

                            console.log('txt'); 
                            extension = "txt"; 
                            var removeString = 'data:text/plain;base64,'; 


                          } else if(chatFileType.indexOf(".sheet") != -1) {

                            console.log('xlsx'); 
                            extension = "xlsx";   
                            var removeString = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,'; 

                          }   

                          

                          // var base64Data = chatAttachment.replace(/^data:image\/png;base64,/, "");
                          var base64Data = chatAttachment.replace(removeString, ""); /*remove file type string from base64 to get proper output*/

                          var tempDir = "uploads/Temp/"+chatFileName; /*upload temp path*/

                          var uploadDir = "uploads/"+messageData.receiverUniqueUserId+"/chatAttachments/";

                          var uploadFileName = dtnow + '_' + chatFileName;

                          var chatAttachmentPath = messageData.receiverUniqueUserId+"/chatAttachments/"+uploadFileName;

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


                                      var chatData={ /*insert data*/

                                          "senderUserId":senderUserId,
                                          "receiverUserId":receiverUserId,
                                          "parentStudentId" : messageData.parentStudentId,/*have value only for parent peer*/
                                          "roomId" : messageData.chatRoomId,
                                          "chatMessage" : messageData.chatMessage,
                                          "chatType" : messageData.chatType,
                                          "chatAttachment" : chatAttachmentPath,
                                          "createdOn" : dateymd

                                      };

                                      sharedmodel.dbinsert(chatTable, chatData) /*insert my Chat Details*/
                                      .then((myChat) => {

                                          if(myChat.insertId!=""){

                                            /*response data*/
                                            var messageChatData = {  
                                                  "roomId" : messageData.chatRoomId,
                                                  "userChatId": myChat.insertId,
                                                  "chatMessage": messageData.chatMessage,
                                                  "chatAttachment": chatAttachmentPath,
                                                  "chatType": messageData.chatType,
                                                  "chatStatus": 'unread',
                                                  "parentStudentId" : messageData.parentStudentId, /*have value only for parent peer*/
                                                  "studentFname" : messageData.studentFname, /*have value only for parent peer*/
                                                  "studentLname" : messageData.studentLname, /*have value only for parent peer*/ 
                                                  "createdOn": dateymd
                                                  
                                            };
                                 
                                            callback(200, messageChatData);/*response*/

                                          } else {

                                            callback(0, "Request Failed !");/*response*/

                                          }

                                          

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

 

                      }

                  }

                 


                } else {

                  callback(0, 'Invalid Receiver !');/*response*/

                }

   
            })
            .catch((err)=>{

              console.log(err); callback(0, 'Request Failed !');/*response*/ 


            });


          } else {

              callback(0, 'Invalid Sender !');/*response*/

          }


        })
        .catch((err)=>{

           console.log(err); callback(0, 'Request Failed !');/*response*/ 

        });


    });



    /* listening to the user disconnection */
    socket.on('disconnect', () => {

      console.log(socket.id + ' : disconnected...');

      console.log("iamOffline");

      var userTable = "users";

      var userOnlineUpdateData = { "chatOnlineStatus" : "0", "chatSocketId" : '' };

      var onlineUpdateCondition = { "chatSocketId" : socket.id };

       /* Listen when a user is online : update online status to DB */
      sharedmodel.dbupdate(userTable, userOnlineUpdateData, onlineUpdateCondition) /* update online status */
      .then(function(){

         /* emit when new user in online */
         socket.broadcast.emit('offlineUsersListUpdated',"iamOffline"); 
      });

    });


    /* Listen for the request from client to fetch the user list */
    socket.on('getUsers', (data) => {

      getChatUsers(data);

    });


    /*Listen typing event On & Emit*/
    socket.on('typingEvent', (data) => {

      socket.broadcast.to(data.chatRoomId).emit('typingEventRes', data);

    });


     /*Listen on block chat*/
    socket.on('chatBlock', (blockData) => {

        const callback = function (status, message) {/*call back fn.*/

          var resData = { "status": status, "message": message };

           
          resCallbackFn(resData);/*function for message sender*/

          socket.broadcast.to(blockData.chatRoomId).emit('chatBlockRes', resData); /*response to other peer*/

        };


        if(blockData.actionUniqueUserId == ""){

          callback(0, 'Action User Id Should Not Be Empty !');/*response*/ 

        } else if(blockData.ContactId == ""){

          callback(0, 'Contact Id Should Not Be Empty !');/*response*/ 

        } else {

          sharedmodel.dbGetUserIdfromUuid(blockData.actionUniqueUserId) /*get action userid from uniqueuserid*/
          .then(function (actionUserData) {

              if(actionUserData.length>0) {

                var actionUserId = actionUserData[0].userId;

                var actionUserRole = actionUserData[0].userRole; /*block action taken by user role*/

                var updateTable = "teacherstudentparentcontacts";

                if(actionUserRole==4){ /*if block action taken by teacher*/

                  var updateData ={"teacherBlockChatStatus" : 1};

                } else {/*if block action taken by parent or student*/

                  var updateData ={"userBlockChatStatus" : 1};

                }

                var updateCondition = {"ContactId" : blockData.ContactId};

                sharedmodel.dbupdate(updateTable, updateData, updateCondition)/*update chat block status*/
                .then(function(){

                  callback(200, 'Successfully Blocked');/*response*/ 

                })
                .catch(function(err){

                  console.log(err); 
                  callback(0, 'Request Failed !');/*response*/ 

                });

              
              } else {

                  callback(0, 'Invalid Action User !');/*response*/

              }


          })
          .catch((err)=>{

            console.log(err); 
            callback(0, 'Request Failed !');/*response*/ 


          });

        }

    });


//************************************************************************************************************************************************************//
    
    socket.on('leave room', (data) => { 

      socket.leave(data.roomId);

    });


    socket.on('event', (data) => {

      console.log(data.message);
      socket.broadcast.to(data.room).emit('event', data);

    });


  });



  // /*attachment upload*/
  // chatAttachmentUpload: async function(req){




  // }
  

}