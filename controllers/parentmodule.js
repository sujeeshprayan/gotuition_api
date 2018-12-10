/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../config/db");
var parentmodel = require("../models/parentmodule");
var sharedmodel = require("../models/shared/shared");
var datetime = require("node-datetime");
var randomize = require("randomatic");
var shared = require('../controllers/shared/shared');


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

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

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

                                    console.log("counter :"+ i + ", length :"+parentStudents.length);

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

                    callback(0, "Invalid User !", "", "", "", 401);/*response with 401 header status*/

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Get Details !", "", "", "");

            });
     }

});


/*parent profile strength*/
router.post('/parentprofilestrength', function(req, res){

    const callback = function(status, message, profileStrength){

        res.json({"status":status, "message":message, "profileStrength": profileStrength});
    } 

     if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

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

                        callback(200, "Success", profileStrength); 

                    })    
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "");

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




/*parent profile : student insert*/
router.post('/parentstudentinsert', function(req, res){

	const callback = function(status, message, parentStudentId){

		res.json({"status":status, "message":message, "parentStudentId":parentStudentId});

	}

	var subjectTopicIds = req.body.subjectTopicIds;


	if(req.body.uniqueUserId==""){

 			callback(0, "User Id Should Not Be Empty !");

	} else if(req.body.studentFname=="") { 

			callback(0, "Student Firstname Should Not Be Empty !");

	} else if(req.body.studentLname=="") { 

			callback(0, "Student Lastname Should Not Be Empty !");

	} else if(subjectTopicIds.length == 0) { 

			callback(0, "subject Topic Id Should Not Be Empty !");
	}
	else { 

		 sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var parentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var studentFname = req.body.studentFname;

                    var studentLname = req.body.studentLname;


                    /* insert parent students */
                	var insertData = {
                        "parentUserId": parentUserId,
                        "studentFname": studentFname,
                        "studentLname": studentLname,
                        "updatedOn": dateymd
                    };

                    var insertTable = "parentstudents";
                   
                     sharedmodel.dbinsert(insertTable, insertData)

                        .then(function (data) {

                        	console.log(data);

                        	var parentStudentId = data.insertId;

                            var i = 1;/*count*/

                        	/*read array of subjects */
                            subjectTopicIds.forEach(function (item) {/*read array of subjectTopicIds */

                                var courseTable = "parentstudentcourses";/*subject table*/

                                var courseData = {

                                    "parentStudentId": parentStudentId,

                                    "subjectTopicId": item

                                };

                                sharedmodel.dbinsert(courseTable, courseData) /*update subject to parentstudentcourses table*/

                                    .then(function (courseUpdatedResult) {

                                        console.log("Count: "+i+", "+"Array length: "+subjectTopicIds.length);

                                        var courseStTable = "studentcourses";/*subject table*/

                                        var courseData = {

                                            "studentUserId": parentUserId, /*parent id to studentcourses*/

                                            "subjectTopicId": item

                                        };

                                        /*check parent userid  and subject already exists in studentscourses table*/
                                        var fields = "studentUserId";

                                        var condition1 = {"studentUserId":parentUserId};

                                        var condition2 = {"subjectTopicId":item};

                                        sharedmodel.dbgetdetails2and(fields, courseStTable, condition1, condition2)
                                        .then(function(checkData){
                                            
                                            if(checkData.length == 0){ /*if not exists parent user id and subjectTopicId in studentcourses*/

                                                sharedmodel.dbinsert(courseStTable, courseData) /*insert subject to studentcourses table*/
                                                .then(function (courseParentUpdatedResult) {

                                                    if(i==subjectTopicIds.length){ /*last loop*/

                                                         callback(200, studentFname+" "+studentLname+" Details Updated Successfully",parentStudentId);

                                                    }

                                                    i += 1;
                                                 })
                                                .catch(function (err) {

                                                    console.log(err);
                                                    // callback(0,"Failed To Update !";

                                                });

                                            } else {


                                                if(i==subjectTopicIds.length){ /*last loop*/

                                                     callback(200, studentFname+" "+studentLname+" Details Updated Successfully",parentStudentId);

                                                }

                                                i += 1;

                                            }

                                        })
                                        .catch(function (err) {

                                            console.log(err);
                                            // callback(0,"Failed To Update !";

                                        });

                                    })
                                    .catch(function (err) {

                                        console.log(err);
                                        // callback(0,"Failed To Update !";

                                    });
                               
                            });
 

                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Update Student Details !");

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



/*parent profile : student update details and subjects*/
router.post('/parentstudentupdate', function(req, res){

	const callback = function(status, message){

		res.json({"status":status, "message":message});

	}

	var subjectTopicIds = req.body.subjectTopicIds;

	var parentStudentId = req.body.parentStudentId;

	if(req.body.uniqueUserId==""){

 			callback(0, "User Id Should Not Be Empty !");

	} else if(parentStudentId==""){

 			callback(0, "Parent Student Id Should Not Be Empty !");

	} else if(req.body.studentFname=="") { 

			callback(0, "Student Firstname Should Not Be Empty !");

	} else if(req.body.studentLname=="") { 

			callback(0, "Student Lastname Should Not Be Empty !");

	} else if(subjectTopicIds.length == 0) { 

			callback(0, "subject Topic Id Should Not Be Empty !");
	} else {

		 sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var parentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    /* update parent students */
                	var updateData = {
                        "studentFname": req.body.studentFname,
                        "studentLname": req.body.studentLname,
                        "updatedOn": dateymd
                    };

                    var updateTable = "parentstudents";

                    var condition = { "parentStudentId": parentStudentId };

                    sharedmodel.dbupdate(updateTable, updateData, condition)/*student deails update*/

                      .then(function () {

	                    	var i = 1;/*count*/

		                    /* remove subjects if exists ,before add new*/
		                    var remove_Table = "parentstudentcourses";

		                    var remove_Condition = { "parentStudentId": parentStudentId };

		                    sharedmodel.dbremove(remove_Table, remove_Condition)
	                        .then(function () {

		                        	/*read array of subjects */
		                            subjectTopicIds.forEach(function (item) {/*read array of subjectTopicIds */

		                                var courseTable = "parentstudentcourses";/*subject table*/

		                                var courseData = {

		                                    "parentStudentId": parentStudentId,

		                                    "subjectTopicId": item

		                                };

		                                sharedmodel.dbinsert(courseTable, courseData) /*update subject to table*/

		                                    .then(function (courseUpdatedResult) {

		                                        console.log("Count: "+i+", "+"Array length: "+subjectTopicIds.length);


                                                if(i==subjectTopicIds.length){ /*last loop*/

                                                    /* remove subjects if exists in studentcourses, before add new*/
                                                    var remove_Table = "studentcourses";

                                                    var remove_Condition = { "studentUserId": parentUserId };

                                                    sharedmodel.dbremove(remove_Table, remove_Condition)
                                                    .then(function () {

                                                        parentmodel.getParentStudentsDistinctSubjectTopicIds(parentUserId) /*get ParentStudents Distinct Subject TopicIds*/
                                                        .then(function(distinctTopics){


                                                            if(distinctTopics.length>0){

                                                                var kk=1;

                                                                /*read array of subjects */
                                                                    distinctTopics.forEach(function (itemTopics) {/*read array of subjectTopicIds */

                                                                        var coursesStTable = "studentcourses";/*subject table*/

                                                                        var coursesData = {

                                                                            "studentUserId": parentUserId,

                                                                            "subjectTopicId": itemTopics.subjectTopicId,

                                                                            "updatedOn":dateymd

                                                                        };

                                                                        sharedmodel.dbinsert(coursesStTable, coursesData) /*update subject to table*/

                                                                        .then(function (courseUpdatedResult) {

                                                                             if(kk==distinctTopics.length){ /*last loop*/

                                                                                 callback(200, "Details Updated Successfully");

                                                                             }


                                                                        kk++;
                                                                        
                                                                        })
                                                                        .catch(function (err) {

                                                                            console.log(err);
                                                                            // callback(0,"Failed To Update !";

                                                                        });


                                                                    });

                                                            } else {

                                                                callback(200, "Details Updated Successfully");
                                                            }




                                                        })
                                                        .catch(function (err) {

                                                            console.log(err);
                                                            // callback(0,"Failed To Update !";

                                                        });

                                                    })
                                                    .catch(function (err) {

                                                        console.log(err);
                                                        // callback(0,"Failed To Update !";

                                                    });


                                                    

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
 
                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Update Student Details !");

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



 

/*parent profile : student remove*/
router.post('/parentstudentremove', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message });

    }

    var parentStudentId = req.body.parentStudentId;


    if(req.body.uniqueUserId==""){

            callback(0, "User Id Should Not Be Empty !");

    } else if(parentStudentId=="") { 

            callback(0, "Parent Student Id Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)

            .then(function (data) {

                if (data.length > 0) {

                    var parentUserId = data[0].userId;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var courseTable = "parentstudentcourses";

                    var courseCondition = { "parentStudentId":parentStudentId };

                    sharedmodel.dbremove(courseTable, courseCondition) /*remove student courses*/

                    .then(function (data) {

                        var parentStudentTable = "parentstudents";

                        var studentCondition = { "parentStudentId":parentStudentId };

                        sharedmodel.dbremove(parentStudentTable, studentCondition) /*remove student*/
                         .then(function (stData) {

                            /* remove subjects if exists in studentcourses, before add new*/
                            var remove_Table = "studentcourses";

                            var remove_Condition = { "studentUserId": parentUserId };

                            sharedmodel.dbremove(remove_Table, remove_Condition)
                            .then(function () {

                                parentmodel.getParentStudentsDistinctSubjectTopicIds(parentUserId) /*get ParentStudents Distinct Subject TopicIds*/
                                .then(function(distinctTopics){


                                    if(distinctTopics.length>0){

                                        var kk=1;

                                        /*read array of subjects */
                                            distinctTopics.forEach(function (itemTopics) {/*read array of subjectTopicIds */

                                                var coursesStTable = "studentcourses";/*subject table*/

                                                var coursesData = {

                                                    "studentUserId": parentUserId,

                                                    "subjectTopicId": itemTopics.subjectTopicId,

                                                    "updatedOn":dateymd

                                                };

                                                sharedmodel.dbinsert(coursesStTable, coursesData) /*update subject to table*/

                                                .then(function (courseUpdatedResult) {

                                                     if(kk==distinctTopics.length){ /*last loop*/

                                                           callback(200, "Successfully Removed !");

                                                     }


                                                kk++;
                                                
                                                })
                                                .catch(function (err) {

                                                    console.log(err);
                                                    // callback(0,"Failed To Update !";

                                                });


                                            });

                                    } else {

                                          callback(200, "Successfully Removed !");
                                    }




                                })
                                .catch(function (err) {

                                    console.log(err);
                                    // callback(0,"Failed To Update !";

                                });

                            })
                            .catch(function (err) {

                                console.log(err);
                                // callback(0,"Failed To Update !";

                            });


                        })
                        .catch(function (err) {

                            console.log(err);
                            callback(0, "Failed To Remove !");

                        });

                    })
                    .catch(function (err) {

                        console.log(err);
                        callback(0, "Failed To Remove !");

                    });

                } else {

                    callback(0, "Invalid User !");

                }

            })
            .catch(function (err) {
                
                console.log(err);
                callback(0, "Failed To Remove !");

            });

    }

});



/*teacher profile update : subjects*/
router.post('/teacherprofilesubjectupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    /*teacher subject*/
    var teacherSubjects = req.body.subjectTopicIds;

    console.log(req.body.uniqueUserId);

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else  if (teacherSubjects.length == 0) { /*if teacherSubjects array not empty */
    
        callback(0,"Teacher Subjects Should Not Be Empty !");

    } 

    else {

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





/*Parent Profile Registration : Student with Course Details*/
router.post('/parent-profile-registration-student-course-details',function(req, res){

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

                parentmodel.getParentStudents(userId) /*Fetch parentStudents*/
                .then(function (parentStudents) {

                    console.log(parentStudents);

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

                                    callback(200, "Success", nickName, parentStudents); /*call back with parent students courses*/


                                }

                                i+=1; /*counter increment*/


                            })
                            .catch(function(err){

                                console.log(err);

                            });

                        });

                    } else {

                        callback(200, "Success", nickName, parentStudents); /*call back with parent students*/

                    }


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