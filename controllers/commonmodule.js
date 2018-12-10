/*jslint es6:true*/
/*global require, module,  __dirname */
"use strict";
var express = require("express");
var router = express.Router();
var db = require("../config/db");
var commonmodel = require("../models/commonmodule");
var sharedmodel = require("../models/shared/shared");
var teachermodel = require("../models/teachermodule");
var studentmodel = require("../models/studentmodule");
var datetime = require("node-datetime");
var randomize = require("randomatic");
var shared = require('../controllers/shared/shared');
var split = require('split-string');
var emailvalidator = require('email-validator');




/*search suggestions*/
router.post('/search-suggestions',function(req, res){

    const callback = function(status, message, suggestions){

        res.json({"status":status, "message":message, "suggestions":suggestions});
    }

    var searchKey = req.body.searchKey;


    if (searchKey == "") { 

        callback(0,"Search Key Should Not Be Empty !", "");

    }

    else {

       
        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        var searchKeyArr = split(searchKey, { separator: " "}); 

        commonmodel.getSearchSuggestions(searchKeyArr) /*search*/

        .then(function (searchResults) {

            if(searchResults.length > 0){

                callback(200, "Success", searchResults);     

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});



/*Search Result Filter Category Options*/
router.post('/search-result-filter-subject-category-list',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds;


    if (searchResultTeachersSubjectTopicIds == "") { 

        callback(0, "Search Result Subject Topic Ids Should Not Be Empty !", "");

    }  

    else {

       
        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        console.log(searchResultTeachersSubjectTopicIds);

        //searchResultTeachersSubjectTopicIds = [1,43,60];

        var searchResultSubjectTopicIds = searchResultTeachersSubjectTopicIds.join(','); 

        console.log(searchResultSubjectTopicIds);

        commonmodel.searchResultFilterCategoryOptions(searchResultSubjectTopicIds) /*search*/

        .then(function (Results) {

            if(Results.length > 0){

                callback(200, "Success", Results);     

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});



 


/*Search Result Filter SubCategory Options*/
router.post('/search-result-filter-subject-subcategory-list',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds;


    if (searchResultTeachersSubjectTopicIds == "") { 

        callback(0, "Search Result Subject Topic Ids Should Not Be Empty !", "");

    } else  if (req.body.subjectCategoryId == "") { 

        callback(0, "Subject Category Id Should Not Be Empty !", "");

    }     

    else {

       
        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        console.log(searchResultTeachersSubjectTopicIds);

        //searchResultTeachersSubjectTopicIds = [1,43,60];

        var searchResultSubjectTopicIds = searchResultTeachersSubjectTopicIds.join(','); 

        console.log(searchResultSubjectTopicIds);

        commonmodel.searchResultFilterSubCategoryOptions(searchResultSubjectTopicIds, req.body.subjectCategoryId) /*search*/

        .then(function (Results) {

            if(Results.length > 0){

                callback(200, "Success", Results);     

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});




/*Search Result Filter Group Options*/
router.post('/search-result-filter-subject-group-list',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds;


    if (searchResultTeachersSubjectTopicIds == "") { 

        callback(0, "Search Result Subject Topic Ids Should Not Be Empty !", "");

    } else  if (req.body.subjectSubcategoryId == "") { 

        callback(0, "Subject Sub Category Id Should Not Be Empty !", "");

    }     

    else {

       
        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        console.log(searchResultTeachersSubjectTopicIds);

        //searchResultTeachersSubjectTopicIds = [1,43,60];

        var searchResultSubjectTopicIds = searchResultTeachersSubjectTopicIds.join(','); 

        console.log(searchResultSubjectTopicIds);

        commonmodel.searchResultFilterGroupOptions(searchResultSubjectTopicIds, req.body.subjectSubcategoryId) /*search*/

        .then(function (Results) {

            if(Results.length > 0){

                callback(200, "Success", Results);     

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});





/*Search Result Filter Subject Options*/
router.post('/search-result-filter-subject-subject-list',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }

    var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds;


    if (searchResultTeachersSubjectTopicIds == "") { 

        callback(0, "Search Result Subject Topic Ids Should Not Be Empty !", "");

    } else  if (req.body.subjectGroupId == "") { 

        callback(0, "Subject Group Id Should Not Be Empty !", "");

    }     

    else {

       
        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        console.log(searchResultTeachersSubjectTopicIds);

        //searchResultTeachersSubjectTopicIds = [1,43,60];

        var searchResultSubjectTopicIds = searchResultTeachersSubjectTopicIds.join(','); 

        console.log(searchResultSubjectTopicIds);

        commonmodel.searchResultFilterSubjectOptions(searchResultSubjectTopicIds, req.body.subjectGroupId) /*search*/

        .then(function (Results) {

            if(Results.length > 0){

                callback(200, "Success", Results);     

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});





/*Website landing page search*/
router.post('/landingpageteacherssearch',function(req, res){

    const callback = function(status, message, teachers){

        res.json({"status":status, "message":message, "teachers":teachers});
    }

    var searchKey = req.body.searchKey;


    if (searchKey == "") { 

        callback(0,"Search Key Should Not Be Empty !", "");

    } 

    // else if (req.body.filterConditionField == "") { 

    //     callback(0,"Filter Condition Field Should Not Be Empty. Please Assign 0 OR Condition Field Name (subjectCategoryId OR subjectSubcategoryId OR subjectGroupId OR subjectTopicId) !", "");

    // } else if (req.body.filterConditionFieldId == "") { 

    //     callback(0,"Filter Condition Field Id Should Not Be Empty. Please Assign 0 OR Condition Field Id !", "");

    // } else if (req.body.searchResultTeachersSubjectTopicIds == "") { 

    //     callback(0,"Search Result Subject Topic Ids Should Not Be Empty. Please Assign 0 OR Subject Topic Ids !", "");

    // } 

    else {

        var Latitude = req.body.Latitude;;

        var Longitude = req.body.Longitude;;

        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        var searchKeyArr = split(searchKey, { separator: " "}); 

       // req.body.searchResultTeachersSubjectTopicIds = [1, 2, 3, 4, 12, 22, 42, 43, 60];

       // var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds.join(','); 

       // commonmodel.landingPageTeachersSearch(Latitude, Longitude, searchKeyArr, req.body.filterConditionField, req.body.filterConditionFieldId, searchResultTeachersSubjectTopicIds ) /*search*/
        commonmodel.landingPageTeachersSearch(Latitude, Longitude, searchKeyArr ) /*search*/

        .then(function (searchResults) {

            if(searchResults.length > 0){

                var c = 1;

                searchResults.forEach(function (item, index, array) { /*loop*/

                    var teacherUserId = item.userId;

                    teachermodel.getTeacherTuitionCenterFacilities(teacherUserId) /*Fetch tuition Center Facility*/
                    .then(function (tuitionCenterFacility) {

                        item.tuitionCenterFacility = tuitionCenterFacility; /*tuition Center Facility to searchResults index*/

                        teachermodel.getTeacherCourses(teacherUserId) /*Fetch teacherCourses*/
                        .then(function (teacherCourses) {

                            item.teacherCourses = teacherCourses;/*teacherCourses to searchResults index*/

                            /*check for last loop to send final response*/
                            if (c == searchResults.length) { 

                                /*response*/
                                callback(200, "Success", searchResults);     

                            }

                            c++; /*counter increment*/
                           
                        })
                        .catch(function (err) {

                            //callback(0, "Request Failed !", "");

                            console.log(err);
                        });

                      
                    })
                    .catch(function (err) {

                       //callback(0, "Request Failed !", "");

                        console.log(err);
                    });

                }); 

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});






/*Website landing page search result filter*/
router.post('/landingpageteacherssearch-result-filter',function(req, res){

    const callback = function(status, message, teachers){

        res.json({"status":status, "message":message, "teachers":teachers});
    }

    var searchKey = req.body.searchKey;


    if (searchKey == "") { 

        callback(0,"Search Key Should Not Be Empty !", "");

    } 

    // else if (req.body.filterConditionField == "") { 

    //     callback(0,"Filter Condition Field Should Not Be Empty. Please Assign 0 OR Condition Field Name (subjectCategoryId OR subjectSubcategoryId OR subjectGroupId OR subjectTopicId) !", "");

    // } else if (req.body.filterConditionFieldId == "") { 

    //     callback(0,"Filter Condition Field Id Should Not Be Empty. Please Assign 0 OR Condition Field Id !", "");

    // } else if (req.body.searchResultTeachersSubjectTopicIds == "") { 

    //     callback(0,"Search Result Subject Topic Ids Should Not Be Empty. Please Assign 0 OR Subject Topic Ids !", "");

    // } 

    else {

        var Latitude = req.body.Latitude;;

        var Longitude = req.body.Longitude;;

        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        var searchKeyArr = split(searchKey, { separator: " "}); 

       // req.body.searchResultTeachersSubjectTopicIds = [1, 2, 3, 4, 12, 22, 42, 43, 60];

       // var searchResultTeachersSubjectTopicIds = req.body.searchResultTeachersSubjectTopicIds.join(','); 

       // commonmodel.landingPageTeachersSearch(Latitude, Longitude, searchKeyArr, req.body.filterConditionField, req.body.filterConditionFieldId, searchResultTeachersSubjectTopicIds ) /*search*/
        commonmodel.landingPageTeachersSearch(Latitude, Longitude, searchKeyArr ) /*search*/

        .then(function (searchResults) {

            if(searchResults.length > 0){

                var c = 1;

                searchResults.forEach(function (item, index, array) { /*loop*/

                    var teacherUserId = item.userId;

                    teachermodel.getTeacherTuitionCenterFacilities(teacherUserId) /*Fetch tuition Center Facility*/
                    .then(function (tuitionCenterFacility) {

                        item.tuitionCenterFacility = tuitionCenterFacility; /*tuition Center Facility to searchResults index*/

                        teachermodel.getTeacherCourses(teacherUserId) /*Fetch teacherCourses*/
                        .then(function (teacherCourses) {

                            item.teacherCourses = teacherCourses;/*teacherCourses to searchResults index*/

                            /*check for last loop to send final response*/
                            if (c == searchResults.length) { 

                                /*response*/
                                callback(200, "Success", searchResults);     

                            }

                            c++; /*counter increment*/
                           
                        })
                        .catch(function (err) {

                            //callback(0, "Request Failed !", "");

                            console.log(err);
                        });

                      
                    })
                    .catch(function (err) {

                       //callback(0, "Request Failed !", "");

                        console.log(err);
                    });

                }); 

            } else {

                callback(0, "No details Found !","");

            }
 

        })
        .catch(function (err) {

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});


/*student : teachers search*/
router.post('/teacherssearchbykeywords',function(req, res){

	const callback = function(status, message, teachers){

		res.json({"status":status, "message":message, "teachers":teachers});
	}

	var searchKey = req.body.searchKey;


	if(req.body.uniqueUserId==""){

		callback(0,"User Id Should Not Be Empty !", "");

	} else  if (searchKey == "") { 

		callback(0,"Search Key Should Not Be Empty !", "");

	} 

	else {

		sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
		.then(function (data) {
			if (data.length > 0) {

				var userId = data[0].userId;

				var userLongitude = data[0].Longitude;

				var userLatitude = data[0].Latitude;

				var dt = datetime.create();

				var dateymd = dt.format('Y-m-d H:M:S');

				var searchKeyArr = split(searchKey, { separator: " "}); 

				commonmodel.teacherssearchbykeywords(userLongitude, userLatitude, searchKeyArr) /*search*/

				.then(function (searchResults) {


		 				if(searchResults.length > 0){

  							var c = 1;

		                    searchResults.forEach(function (item, index, array) { /*loop*/

		                    	var teacherUserId = item.userId;

		                   	 	teachermodel.getTeacherTuitionCenterFacilities(teacherUserId) /*Fetch tuition Center Facility*/
								.then(function (tuitionCenterFacility) {

		                            item.tuitionCenterFacility = tuitionCenterFacility; /*tuition Center Facility to searchResults index*/

		                            teachermodel.getTeacherCourses(teacherUserId) /*Fetch teacherCourses*/
		                            .then(function (teacherCourses) {

			                            item.teacherCourses = teacherCourses;/*teacherCourses to searchResults index*/

			                            /*start - check teacher already in contact list*/
		                            	var fields = ["ContactId","contactUserAction"];

			                            var table = "teacherstudentparentcontacts";

			                            var condition1 = { "teacherUserId":teacherUserId };

			                            var condition2 = { "contactUserId":userId };

			                            sharedmodel.dbgetdetails2and(fields, table, condition1, condition2)/*check teacher already in contact list*/
			                            .then(function (userContactData) {

			                                console.log(userContactData);

			                                if(userContactData.length > 0) { /*if entry exists*/

			                                	item.teacherInMyContactList = "Yes";/*status for teacherInMyContactList*/
                                                item.contactUserAction = userContactData[0].contactUserAction; /*contactUserAction on teacher*/

		                              		} else {

		                              			item.teacherInMyContactList = "No";/*status for teacherInMyContactList*/
                                                item.contactUserAction = '0'; /*contactUserAction on teacher*/

		                              		}


											/*check for last loop to send final response*/
		                              		if (c == searchResults.length) { 

				                            	/*response*/
			                              		callback(200, "Success", searchResults);     

				                            }


				                            c++; /*counter increment*/

										})
				                        .catch(function (err) {

				                            //callback(0, "Request Failed !", "");
				                            console.log(err);

				                        });/*end - check teacher already in contact list*/

 
			                           
			                        })
			                        .catch(function (err) {

			                            //callback(0, "Request Failed !", "");

			                            console.log(err);
			                        });

		                          
		                        })
		                        .catch(function (err) {

		                           //callback(0, "Request Failed !", "");

		                            console.log(err);
		                        });
 
		                	}); 

		             	} else {

		                	callback(0, "No details Found !","");

		              	}
         

				})
				.catch(function (err) {

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




/*student : teachers polygon search*/
router.post('/teacherssearchbypolygonselectiononmap',function(req, res){

    const callback = function(status, message, teachers){

        res.json({"status":status, "message":message, "teachers":teachers});
    }

    var searchKey = req.body.searchKey;


    if(req.body.uniqueUserId==""){

        callback(0,"User Id Should Not Be Empty !", "");

    } else  if (searchKey == "") { 

        callback(0,"Search Key Should Not Be Empty !", "");

    } 

    else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {
            if (data.length > 0) {

                var userId = data[0].userId;

                var userLongitude = data[0].Longitude;

                var userLatitude = data[0].Latitude;

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var searchKeyArr = split(searchKey, { separator: " "}); 

                commonmodel.teacherssearchpolygon(userLongitude, userLatitude, searchKeyArr) /*search*/

                .then(function (searchResults) {


                        if(searchResults.length > 0){

                            var c = 1;

                            searchResults.forEach(function (item, index, array) { /*loop*/

                                var teacherUserId = item.userId;

                                teachermodel.getTeacherTuitionCenterFacilities(teacherUserId) /*Fetch tuition Center Facility*/
                                .then(function (tuitionCenterFacility) {

                                    item.tuitionCenterFacility = tuitionCenterFacility; /*tuition Center Facility to searchResults index*/

                                    teachermodel.getTeacherCourses(teacherUserId) /*Fetch teacherCourses*/
                                    .then(function (teacherCourses) {

                                        item.teacherCourses = teacherCourses;/*teacherCourses to searchResults index*/

                                        /*start - check teacher already in contact list*/
                                        var fields = "ContactId";

                                        var table = "teacherstudentparentcontacts";

                                        var condition1 = { "teacherUserId":teacherUserId };

                                        var condition2 = { "contactUserId":userId };

                                        sharedmodel.dbgetdetails2and(fields, table, condition1, condition2)/*check teacher already in contact list*/
                                        .then(function (userContactData) {

                                            console.log(userContactData);

                                            if(userContactData.length > 0) { /*if entry exists*/

                                                item.teacherInMyContactList = "Yes";/*status for teacherInMyContactList*/

                                            } else {

                                                item.teacherInMyContactList = "No";/*status for teacherInMyContactList*/

                                            }


                                            /*check for last loop to send final response*/
                                            if (c == searchResults.length) { 

                                                /*response*/
                                                callback(200, "Success", searchResults);     

                                            }


                                            c++; /*counter increment*/

                                        })
                                        .catch(function (err) {

                                            //callback(0, "Request Failed !", "");
                                            console.log(err);

                                        });/*end - check teacher already in contact list*/

 
                                       
                                    })
                                    .catch(function (err) {

                                        //callback(0, "Request Failed !", "");

                                        console.log(err);
                                    });

                                  
                                })
                                .catch(function (err) {

                                   //callback(0, "Request Failed !", "");

                                    console.log(err);
                                });
 
                            }); 

                        } else {

                            callback(0, "No details Found !","");

                        }
         

                })
                .catch(function (err) {

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







/*Student OR Parent contact Insert Or Update*/
router.post('/parentstudentcontactinsertupdate',function(req, res){

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

    } else if(req.body.actionFlag == ""){ /* actionFlag ==> { 1=Viewed, 2=Contacted, 3=Shortlisted, 4=Sent Admission Request, 5=Removed, 6=FlagAsInappropriate, 7=ContactRevealed }*/

         callback(0, "Action Flag Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*check user*/
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;


                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*check user*/
                    .then(function (teacherdata) {
                        
                        if (teacherdata.length > 0) {

                            var teacherUserId = teacherdata[0].userId;

		                    var teacheUniqueUserId = teacherdata[0].uniqueUserId;

		                    var teacherFname = teacherdata[0].Fname;

		                    var teacherLname = teacherdata[0].Lname;

		                    if(teacherLname==null) { 

		                        var teacherFnameLname = teacherFname;

		                    } else {

		                        var teacherFnameLname = teacherFname+' '+teacherLname;

		                    }

		                    var userRole = teacherdata[0].userRole;

		                    var teacherProfileLink = "user/teacher/details/"+teacheUniqueUserId;

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var actionUniqueUserId = req.body.actionUniqueUserId;

                            if(actionUniqueUserId == req.body.uniqueUserId){ /*if action user is student or parent */
                               
                                 var actionUserId = userId;

                            } else { /*if action user is teacher*/
                               
                            	 var actionUserId = teacherUserId;
                            }

                            var fields = "ContactId";

                            var table = "teacherstudentparentcontacts";

                            var condition1 = { "teacherUserId":teacherUserId };

                            var condition2 = { "contactUserId":userId };

                            sharedmodel.dbgetdetails2and(fields, table, condition1, condition2)
                            .then(function (userContactData) {

                                console.log(userContactData);

                                /* Action Flags = {1=Viewed, 2=Contacted, 3=Shortlisted, 4=Sent Admission Request, 5=Removed, 6=FlagAsInappropriate, 7=ContactRevealed, 8=TeacherAdmited  } */

                                /*start - actionFlag check*/
                                if(actionFlag == 1) { /*viewed*/

                                     var contactData = {
                                        "contactUserAction" : actionFlag, /*viewed status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Visited";

                                    var logAction = 'You Have Visited <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>`s profile'; /*logAction Message*/

                                } else if(actionFlag == 2) { /*Contacted*/

                                    var contactData = {
                                        "contactUserAction" : actionFlag, /*Contacted status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Added To Contact";

                                    var logAction = 'You Have Contacted <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 3) { /*shortlisted*/

                                    var contactData = {
                                        "contactUserAction" : actionFlag, /*Shortlisted status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Shortlisted";

                                    var logAction = 'You Have Shortlisted <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/

                                
                                } else if(actionFlag == 4) { /*Sent Admission Request*/

                                    var contactData = {
                                        "contactUserAction" : actionFlag, /*Sent Admission Request status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Sent Admission Request";

                                    var logAction = 'You Have Sent Admission Request To <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 5) { /*Removed*/

                                    var contactData = {
                                        "contactUserAction" : actionFlag, /*Removed status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Removed";

                                    var logAction = 'You Have Removed <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 6) { /*FlagAsInappropriate*/

                                    var contactData = {
                                        "flagInappropriateStatus" : 1, /*FlagAsInappropriate Status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Flagged As Inappropriate";

                                    var logAction = 'You Have Flagged As Inappropriate On <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/


                                } else if(actionFlag == 7) { /*ContactRevealed */

                                    var contactData = {
                                        "contactRevealedStatus" : 1, /*ContactRevealed Status*/
                                        "updatedOn": dateymd
                                    };

                                    var messageHint = "Contact Revealed";

                                    var logAction = 'You Have Revealed Contact Of <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/


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
                                        "contactUserAction" : actionFlag, /*may be viewed as first action*/
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







/*Student OR Parent contact Reveal Insert Or Update*/
router.post('/parentstudentcontactrevealinsertupdate',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details});
    }


    if(req.body.uniqueUserId == ""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.teacherUniqueUserId == ""){

         callback(0, "Teacher User Id Should Not Be Empty !");

    } else if(req.body.contactRevealedStatus == ""){ /* contactRevealedStatus = 1 */

         callback(0, "Contact Revealed Status Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*check user*/
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;


                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*check user*/
                    .then(function (teacherdata) {
                        
                        if (teacherdata.length > 0) {

                            var teacherUserId = teacherdata[0].userId;

                            commonmodel.getCurrentMonthRecordUserRevealedContacts(userId) /*check number of contacts revealed on current month*/
                            .then(function (contactsRevealedCurrentMonth) {

                                console.log(contactsRevealedCurrentMonth);

                                 console.log(contactsRevealedCurrentMonth.length);

                                 if(contactsRevealedCurrentMonth.length>=5) /*only five reveal per month*/
                                 {
                                    /*response*/
                                    callback(0, "Exceed Maximum Reveal. Only Five Reveal Allowed Per Month !", "");

                                 } else {


                                    var teacherUniqueUserId = teacherdata[0].uniqueUserId;

                                    var teacherFname = teacherdata[0].Fname;

                                    var teacherLname = teacherdata[0].Lname;

                                    if(teacherLname==null) { 

                                        var teacherFnameLname = teacherFname;

                                    } else {

                                        var teacherFnameLname = teacherFname+' '+teacherLname;

                                    }

                                    var userRole = teacherdata[0].userRole;

                                    var teacherPhoneVerified = teacherdata[0].phoneVerified;

                                    var teacherEmailVerified = teacherdata[0].emailVerified;

                                    if(teacherPhoneVerified==1){
                                          var teacherPhone = teacherdata[0].Phone;
                                     } else {
                                         var teacherPhone = "Phone Not Verified";
                                     }

                                    if(teacherEmailVerified==1){
                                        var teacherEmail = teacherdata[0].Email;
                                     } else {
                                         var teacherEmail = "Email Not Verified";
                                     }

                                    var details = {"teacherPhone" : teacherPhone, "teacherEmail" : teacherEmail };


                                    var teacherProfileLink = "/teacher/details/"+teacherUniqueUserId;

                                    var dt = datetime.create();

                                    var dateymd = dt.format('Y-m-d H:M:S');
           
                                    var actionUserId = userId;

                                    /*get existing details if exists*/

                                    var fields = [ "ContactId", "contactUserAction", "contactRevealedStatus" ] ;

                                    var table = "teacherstudentparentcontacts";

                                    var condition1 = { "teacherUserId":teacherUserId };

                                    var condition2 = { "contactUserId":userId };

                                    sharedmodel.dbgetdetails2and(fields, table, condition1, condition2) /*get existing details*/
                                    .then(function (userContactData) {

                                        console.log(userContactData);

                                        var logAction = 'You Have Revealed Contact Of <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/

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

                                            if(userContactData[0].contactRevealedStatus==1){

                                                /*response*/
                                                 callback(0, "Contact Already Revealed !", "");


                                            } else {

                                                var contactUserAction = userContactData[0].contactUserAction;

                                                if(contactUserAction==0 || contactUserAction==1) { /*if no action yet or viewed only : make contacted when revealing*/

                                                    var contactData = {

                                                        "contactUserAction" : 2, /*contacted*/
                                                        "contactRevealedStatus" : 1, /*ContactRevealed Status*/
                                                        "contactRevealedDate" : dateymd,
                                                        "updatedOn": dateymd
                                                    
                                                    };


                                                } else {

                                                     var contactData = {

                                                        "contactRevealedStatus" : 1, /*ContactRevealed Status*/
                                                        "contactRevealedDate" : dateymd,
                                                        "updatedOn": dateymd
                                                    
                                                    };

                                                }

                                                var messageHint = "Contact Revealed";
             
                                                var updateCondition = { "ContactId":userContactData[0].ContactId };

                                                sharedmodel.dbupdate(table, contactData, updateCondition) /*contact update*/
                                                .then(function () {

                                                    /*contact logs creation*/
                                                    sharedmodel.dbinsert(logTable, logData); /*contact log insertion*/

                                                    /*response*/
                                                    callback(200, messageHint+" Successfully", details);
                         
                                                })
                                                .catch(function (error) {

                                                    console.log(error);
                                                    callback(0, "Failed to Update !", "");

                                                });

                                            }


                                        } else { /*if same entry not already exists - insert*/


                                             var contactData = {

                                                "teacherUserId": teacherUserId,
                                                "contactUserId" : userId, 
                                                "contactUserAction" : 2, /*may be contacted as first action - contact reveal*/
                                                "contactRevealedStatus" : 1, /*ContactRevealed Status*/
                                                "contactRevealedDate": dateymd,
                                                "updatedOn": dateymd

                                            };


                                            sharedmodel.dbinsert(table, contactData) /*contact insert*/
                                                .then(function () {

                                                    /*contact logs creation*/
                                                    sharedmodel.dbinsert(logTable, logData); /*contact log insertion*/


                                                    /*response*/
                                                    callback(200, "Contact Revealed Successfully", details);
                         
                                                })
                                                .catch(function (error) {

                                                    console.log(error);
                                                    callback(0, "Failed to Update !", "");

                                                });

                                        }
                                        
                                    })
                                    .catch(function(err){

                                          console.log(err);

                                         callback(0,"Failed To Update !", "");

                                    });

                                 }


                            })
                            .catch(function(err){

                                console.log(err);

                                callback(0,"Failed To Update !", "");

                            });

                           
                        } else {

                            callback(0,"Invalid Teacher User !", "");
                        }

                    })
                    .catch(function(err){

                        console.log(err);
                        callback(0,"Failed To Update !", "");

                    });


                } else {

                    callback(0,"Invalid User !", "");

                }


            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Update !", "");

            });
    }

});




/*Student OR Parent FlagInAppropriate Insert Or Update*/
router.post('/parentstudentflaginappropriateinsertupdate', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    


    if(req.body.uniqueUserId == ""){

         callback(0,"User Id Should Not Be Empty !");

    }  else if(req.body.teacherUniqueUserId == ""){

         callback(0, "Teacher User Id Should Not Be Empty !");

    } else if(req.body.flaggedReason == ""){

         callback(0, "Reason Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId) /*check user*/
            .then(function (data) {

                if (data.length > 0) {

                    var userId = data[0].userId;


                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId) /*check user*/
                    .then(function (teacherdata) {
                        
                        if (teacherdata.length > 0) {

                            var teacherUserId = teacherdata[0].userId;

                            var teacherUniqueUserId = teacherdata[0].uniqueUserId;

                            var teacherFname = teacherdata[0].Fname;

                            var teacherLname = teacherdata[0].Lname;

                            if(teacherLname==null) { 

                                var teacherFnameLname = teacherFname;

                            } else {

                                var teacherFnameLname = teacherFname+' '+teacherLname;

                            }

                            var userRole = teacherdata[0].userRole;

                            var teacherPhoneVerified = teacherdata[0].phoneVerified;

                            var teacherEmailVerified = teacherdata[0].emailVerified;

                            var teacherProfileLink = "/teacher/details/"+teacherUniqueUserId;

                            var dt = datetime.create();

                            var dateymd = dt.format('Y-m-d H:M:S');

                            var actionUserId = userId;

                            /*get existing details if exists*/

                            var fields = [ "ContactId", "contactUserAction", "flagInappropriateStatus" ] ;

                            var table = "teacherstudentparentcontacts";

                            var condition1 = { "teacherUserId":teacherUserId };

                            var condition2 = { "contactUserId":userId };

                            sharedmodel.dbgetdetails2and(fields, table, condition1, condition2) /*get existing details*/
                            .then(function (userContactData) {

                                console.log(userContactData);

                                var logAction = 'You Have Flagged Contact Of <a href='+teacherProfileLink+'>'+teacherFnameLname+'</a>'; /*logAction Message*/

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

                                    if(userContactData[0].flagInappropriateStatus==1){

                                        /*response*/
                                        callback(0, "Contact Already Flagged !");


                                    } else {

                                         var contactData = {

                                            "flagInappropriateStatus" : 1, /*flagInappropriate Status*/
                                            "flaggedReason" : req.body.flaggedReason,
                                            "updatedOn": dateymd
                                        
                                        };

                                        var messageHint = "Contact Flagged";
     
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

                                    }


                                } else { /*if same entry not already exists - insert*/


                                     var contactData = {

                                        "teacherUserId": teacherUserId,
                                        "contactUserId" : userId, 
                                        "flagInappropriateStatus" : 1, /*flagInappropriate Status*/
                                        "flaggedReason" : req.body.flaggedReason,
                                        "updatedOn": dateymd

                                    };


                                    sharedmodel.dbinsert(table, contactData) /*contact insert*/
                                        .then(function () {

                                            /*contact logs creation*/
                                            sharedmodel.dbinsert(logTable, logData); /*contact log insertion*/

                                            /*response*/
                                            callback(200, "Contact Flagged Successfully");
                 
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





/*Students / Parents : My Contacts Dashboard Overview */
router.post('/studentparentmycontactsoverview', function(req, res){

    const callback = function(status, message, overview){

        res.json({"status":status, "message":message, "overview":overview});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                var promises = [];

                promises[0] = commonmodel.getStudentParentViewedTeachers(contactUserId);

                promises[1] = commonmodel.getStudentParentContactedTeachers(contactUserId);

                promises[2] = commonmodel.getStudentParentShortlistedTeachers(contactUserId);

                promises[3] = commonmodel.getStudentParentAdmissionRequestedTeachers(contactUserId);

                promises[4] = commonmodel.getStudentParentAdmitedTeachers(contactUserId);

                Promise.all(promises).then(function(overviewData){


                    console.log(overviewData);

                    var overview = {

                        "viewedTeachers" : overviewData[0].length,

                        "contactedTeachers" : overviewData[1].length,

                        "shortlistedTeachers" : overviewData[2].length,

                        "admissionRequestedTeachers" : overviewData[3].length,

                        "admitedTeachers" : overviewData[4].length

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





/*Student / Parent : My Contacts : Viewed Teachers List by Subjects*/
router.post('/studentparentmycontactsviewedteacherslist', function(req, res){

    const callback = function(status, message, courseTeachersData){

        res.json({"status":status, "message":message, "courseTeachersData":courseTeachersData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                commonmodel.getStudentParentCourses(contactUserId) /*get student courses*/
                .then(function(courseTeachersData){

                    console.log(courseTeachersData);


                    if(courseTeachersData.length > 0){

                        var c = 1;

                        courseTeachersData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            commonmodel.getStudentParentCourseTeachersInContactViewed(contactUserId, subjectTopicId) /*Fetch Course-Teachers In Contact*/
                            .then(function (CourseTeachersInContact) {

                                item.CourseTeachersInContact = CourseTeachersInContact; /*CourseTeachersInContact to courseTeachersData index*/

                                /*check for last loop to send final response*/
                                if (c == courseTeachersData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseTeachersData);/*response*/

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





/*Student / Parent : My Contacts : Contacted Teachers List by Subjects*/
router.post('/studentparentmycontactscontactedteacherslist', function(req, res){

    const callback = function(status, message, courseTeachersData){

        res.json({"status":status, "message":message, "courseTeachersData":courseTeachersData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                commonmodel.getStudentParentCourses(contactUserId) /*get student courses*/
                .then(function(courseTeachersData){

                    console.log(courseTeachersData);


                    if(courseTeachersData.length > 0){

                        var c = 1;

                        courseTeachersData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            commonmodel.getStudentParentCourseTeachersInContactContacted(contactUserId, subjectTopicId) /*Fetch Course-Teachers In Contact*/
                            .then(function (CourseTeachersInContact) {

                                item.CourseTeachersInContact = CourseTeachersInContact; /*CourseTeachersInContact to courseTeachersData index*/

                                /*check for last loop to send final response*/
                                if (c == courseTeachersData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseTeachersData);/*response*/

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




/*Student / Parent : My Contacts : Shortlisted Teachers List by Subjects*/
router.post('/studentparentmycontactsshortlistedteacherslist', function(req, res){

    const callback = function(status, message, courseTeachersData){

        res.json({"status":status, "message":message, "courseTeachersData":courseTeachersData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                commonmodel.getStudentParentCourses(contactUserId) /*get student courses*/
                .then(function(courseTeachersData){

                    console.log(courseTeachersData);


                    if(courseTeachersData.length > 0){

                        var c = 1;

                        courseTeachersData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            commonmodel.getStudentParentCourseTeachersInContactShortlisted(contactUserId, subjectTopicId) /*Fetch Course-Teachers In Contact*/
                            .then(function (CourseTeachersInContact) {

                                item.CourseTeachersInContact = CourseTeachersInContact; /*CourseTeachersInContact to courseTeachersData index*/

                                /*check for last loop to send final response*/
                                if (c == courseTeachersData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseTeachersData);/*response*/

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



/*Student / Parent : My Contacts : Admission Requested List by Subjects*/
router.post('/studentparentmycontactsadmissionrequestedteacherslist', function(req, res){

    const callback = function(status, message, courseTeachersData){

        res.json({"status":status, "message":message, "courseTeachersData":courseTeachersData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                commonmodel.getStudentParentCourses(contactUserId) /*get student courses*/
                .then(function(courseTeachersData){

                    console.log(courseTeachersData);


                    if(courseTeachersData.length > 0){

                        var c = 1;

                        courseTeachersData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            commonmodel.getStudentParentAdmissionRequestedTeachers(contactUserId, subjectTopicId) /*Fetch Course-Teachers In Contact*/
                            .then(function (CourseTeachersInContact) {

                                item.CourseTeachersInContact = CourseTeachersInContact; /*CourseTeachersInContact to courseTeachersData index*/

                                /*check for last loop to send final response*/
                                if (c == courseTeachersData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseTeachersData);/*response*/

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




/*Student / Parent : My Contacts : Admisted Teachers List by Subjects*/
router.post('/studentparentmycontactsadmitedteacherslist', function(req, res){

    const callback = function(status, message, courseTeachersData){

        res.json({"status":status, "message":message, "courseTeachersData":courseTeachersData});

    }


    if(req.body.uniqueUserId == "") {

         callback(0,"User Id Should Not Be Empty !");

    }  else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var contactUserId = data[0].userId;

                commonmodel.getStudentParentCourses(contactUserId) /*get student courses*/
                .then(function(courseTeachersData){

                    console.log(courseTeachersData);


                    if(courseTeachersData.length > 0){

                        var c = 1;

                        courseTeachersData.forEach(function (item, index, array) { /*loop*/

                            var subjectTopicId = item.subjectTopicId;

                            commonmodel.getStudentParentCourseTeachersInContactAdmited(contactUserId, subjectTopicId) /*Fetch Course-Teachers In Contact*/
                            .then(function (CourseTeachersInContact) {

                                item.CourseTeachersInContact = CourseTeachersInContact; /*CourseTeachersInContact to courseTeachersData index*/

                                /*check for last loop to send final response*/
                                if (c == courseTeachersData.length) { 

                                    /*response*/
                                   callback(200, "Success", courseTeachersData);/*response*/

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





/*Teacher / Student / Parent  : Invite an existing students*/
router.post('/teacherstudentparentinviteanexistinguser', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }


    if(req.body.uniqueUserId == "") {

         callback(0, "User Id Should Not Be Empty !");

    } else  if(req.body.Name == "") {

         callback(0, "Name Should Not Be Empty !");

    } else  if(req.body.Email == "") {

         callback(0, "Email Should Not Be Empty !");

    } else if (!emailvalidator.validate(req.body.Email)) {/*check email format*/

        callback(0, "Invalid Email Format!", "");

    } else if(req.body.Phone == "") {

         callback(0, "Phone Should Not Be Empty !");

    } else if(req.body.invitingRole == "") {

         callback(0, "Inviting Role Should Not Be Empty !");

    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var senderUserId = data[0].userId;

                if(data[0].Lname!=null)
                {
                    var senderName = data[0].Fname+' '+data[0].Lname;

                } else {

                    var senderName = data[0].Fname;
                }

                var baseurl = shared.getbaseurl();

                /*check role and set signup url*/
                if(req.body.invitingRole==4) { /*teacher*/

                    var signUpUrl = baseurl+'/registration/teacher';
 
                    var roleName = "Teacher";

                } else if(req.body.invitingRole==5) { /*parent*/

                    var signUpUrl = baseurl+'/registration/parent';

                    var roleName = "Parent";  

                } else if(req.body.invitingRole==6) { /*student*/
 
                    var signUpUrl = baseurl+'/registration/student';

                    var roleName = "Student"; 

                }

                /* smsmessage */
                var smsmessage =  'GoTuition : '+senderName+' Invited You To Join On GoTuition As A '+roleName+' : '+signUpUrl;

                /* emailmessage */
                var emailmessage = '<strong> Hi '+req.body.Name+',</strong><br><br>';
                emailmessage += 'GoTuition : '+senderName+' Invited You To Join On GoTuition As A '+roleName+' : '+signUpUrl;
                emailmessage += '<br>';  
                emailmessage += '<br>'; 

                /*invite insertion to db*/
                 var inviteTable="userinviteanexisting";

                var inviteData={

                    "userId":senderUserId,
                    "inviteName":req.body.Name,
                    "inviteEmail" : req.body.Email,
                    "invitePhone" : req.body.Phone,
                    "inviteRole" : req.body.invitingRole
                };


                sharedmodel.dbinsert(inviteTable, inviteData) /*insert invitation*/
                .then(function(){


                    /*get admin email*/
                    sharedmodel.getadminemail()
                    .then(function (adminemailres) {
                        var adminemail = adminemailres[0].Email;
                        var emailfrom = adminemail;
                        var emailto = req.body.Email;
                        var subject = 'GoTuition : '+senderName+' Invited You To Join On GoTuition As A '+roleName;


                        /*sms*/
                        shared.sendsms(req.body.Phone, smsmessage);/*send otp by sms*/
                        
                        /*send email*/
                        shared.sendemail(emailfrom, emailto, subject, emailmessage);/*send email to user*/


                        callback(200, "Successfully Invited !");


                    })
                    .catch(function (err) {
                        console.log(err);

                          callback(0, "Failed To Invite !");

                    });


                })
                .catch(function(err){

                     callback(0, "Failed To Invite !");

                });


            } else {

                callback(0, "Invalid User !");
            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Invite !");

        });
    }

});




/*student/parent profile home*/
router.post('/studentparentprofilehome',function(req, res){

    const callback = function(status, message, details){

        res.json({"status":status, "message":message, "details":details });
    }

     if(req.body.uniqueUserId == ""){

        callback(0,"User Id Should Not Be Empty !", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userLongitude = data[0].Longitude;

                    var userLatitude = data[0].Latitude;

                    var userRole = data[0].userRole;

                    var promises = [];

                    promises[0] = studentmodel.getStudentProfileDetails(userId);

                    promises[1] = commonmodel.getNearbyTeachersDetails(userLongitude, userLatitude, '');

                    if(userRole==5){/*teacher*/

                        promises[2] = commonmodel.getNearbyParentsDetails(userLongitude, userLatitude, userId);/*get except userId user details*/

                    } else {

                        promises[2] = commonmodel.getNearbyParentsDetails(userLongitude, userLatitude,'');
                    }

                    if(userRole==6){ /*student*/

                        promises[3] = commonmodel.getNearbyStudentsDetails(userLongitude, userLatitude, userId);/*get except userId user details*/

                    } else {

                        promises[3] = commonmodel.getNearbyStudentsDetails(userLongitude, userLatitude,'');
                    }

                    promises[4] = commonmodel.getUsersUnreadMessageDetails(userId);

                    promises[5] = commonmodel.getUsersUnreadChatMessageDetails(userId);
                    

                    Promise.all(promises).then(function(Data){

                        console.log(Data);

                        var teacherProfile = Data[0][0];

                        var nearbyTeachers = Data[1].length;

                        var nearbyParents = Data[2].length;

                        var nearbyStudents = Data[3].length;

                        var unreadMessages = Data[4].length;

                        var unreadChatMessages = Data[5].length;


                        console.log(Data[3]);

                        var details ={
                            "uniqueUserId":teacherProfile.uniqueUserId,
                            "Fname":teacherProfile.Fname,
                            "Lname":teacherProfile.Lname,
                            "nickName":teacherProfile.nickName,
                            "Email":teacherProfile.Email,
                            "Gender":teacherProfile.Gender,
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
                            "nearbyTeachersDetails": Data[1],
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







/*Help A Study Insert*/
router.post('/helpastudyinsert', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }


    var subjectTopicIds = req.body.subjectTopicIds;

    if(req.body.uniqueUserId == "") {

         callback(0, "User Id Should Not Be Empty !");

    } else  if(req.body.kidName == "") {

         callback(0, "Name Should Not Be Empty !");

    } else  if(req.body.kidPhone == "") {

         callback(0, "Phone Should Not Be Empty !");

    } else if(req.body.userRelation == "") {

         callback(0, "Relation Should Not Be Empty !");

    } else if(req.body.helpReason == "") {

         callback(0, "Reason Should Not Be Empty !");

    } else if(req.body.kidAddress == "") {

         callback(0, "Address Should Not Be Empty !");

    } else if(req.body.subjectTopicIds.length == 0) {

         callback(0, "Subjects Should Not Be Empty !");

    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {

            if (data.length > 0) {

                var userId = data[0].userId;

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var insertData={

                    "userId":userId,
                    "kidName":req.body.kidName,
                    "kidPhone" : req.body.kidPhone,
                    "userRelation" : req.body.userRelation,
                    "helpReason" : req.body.helpReason,
                    "kidAddress" : req.body.kidAddress,
                    "updatedOn" : dateymd

                 };

                 var insertTable= 'helpakidstudy';

                sharedmodel.dbinsert(insertTable, insertData) /*insert invitation*/
                .then(function(insertData){

                    var i=1;/*counter*/

                    subjectTopicIds.forEach(function(item, index, array){

                        var courseData = {

                            "helpAKidId":insertData.insertId,
                            "subjectTopicId":item,
                            "updatedOn" : dateymd

                         };

                        var courseTable= 'helpakidstudycourses';

                        sharedmodel.dbinsert(courseTable, courseData) /*insert invitation*/
                        .then(function(){


                            if(i==subjectTopicIds.length){

                                 callback(200, "Successfully Sent Request");

                            }

                            i+=1;/*counter inc*/

                        })
                        .catch(function(err){

                            console.log(err);

                        });

                    });

                })
                .catch(function(err){

                     callback(0, "Request Failed !");

                });


            } else {

                callback(0, "Invalid User !");
            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed !");

        });
    }

});






/*Help A Study Public Insert*/
router.post('/helpastudypublicinsert', function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});

    }


    var subjectTopicIds = req.body.subjectTopicIds;

    if(req.body.requesterName == "") {

         callback(0, "Requester Name Should Not Be Empty !");

    } else if(req.body.requesterPhone == "") {

         callback(0, "Requester Name Should Not Be Empty !");

    }  else if(req.body.requesterEmail == "") {

         callback(0, "Requester Name Should Not Be Empty !");

    } else  if(req.body.kidName == "") {

         callback(0, "Kid Name Should Not Be Empty !");

    } else  if(req.body.kidPhone == "") {

         callback(0, "Kid Phone Should Not Be Empty !");

    } else if(req.body.userRelation == "") {

         callback(0, "Relation Should Not Be Empty !");

    } else if(req.body.helpReason == "") {

         callback(0, "Reason Should Not Be Empty !");

    } else if(req.body.kidAddress == "") {

         callback(0, "Address Should Not Be Empty !");

    } else if(req.body.subjectTopicIds.length == 0) {

         callback(0, "Subjects Should Not Be Empty !");

    } else {

        var dt = datetime.create();

        var dateymd = dt.format('Y-m-d H:M:S');

        var insertData={

            "requesterName":req.body.requesterName,
            "requesterPhone":req.body.requesterPhone,
            "requesterEmail" : req.body.requesterEmail,
            "kidName" : req.body.kidName,
            "kidPhone" : req.body.kidPhone,
            "kidAddress" : req.body.kidAddress,
            "userRelation" : req.body.userRelation,
            "helpReason" : req.body.helpReason,
            "updatedOn" : dateymd

         };

         var insertTable= 'helpakidstudy';

        sharedmodel.dbinsert(insertTable, insertData) /*insert invitation*/
        .then(function(insertData){

            var i=1;/*counter*/

            subjectTopicIds.forEach(function(item, index, array){

                var courseData = {

                    "helpAKidId":insertData.insertId,
                    "subjectTopicId":item,
                    "updatedOn" : dateymd

                 };

                var courseTable= 'helpakidstudycourses';

                sharedmodel.dbinsert(courseTable, courseData) /*insert invitation*/
                .then(function(){


                    if(i==subjectTopicIds.length){

                         callback(200, "Successfully Sent Request");

                    }

                    i+=1;/*counter inc*/

                })
                .catch(function(err){

                    console.log(err);

                });

            });

        })
        .catch(function(err){

             callback(0, "Request Failed !");

        });
    }

});






/*student / parent profile update : alert type*/
router.post('/studentparentprofilealerttypeupdate',function(req, res){

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

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    if(userRole==5){

                        var table = "parentprofile";

                    } else if(userRole==6){ /*student*/

                        var table = "studentprofile";

                    }

                    
                    var updatedata = {
                        "alertType": req.body.alertType,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": userId };

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





/*student / parent profile update : alertInterval*/
router.post('/studentparentprofilealertintervalupdate',function(req, res){

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

                    if(userRole==5){

                        var table = "parentprofile";

                    } else if(userRole==6){ /*student*/

                        var table = "studentprofile";

                    }

                    
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





/*student / parent profile update : prefferedTeachersJoinAlert*/
router.post('/studentparentprofileprefferedteachersjoinalertupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.prefferedTeachersJoinAlert==""){

         callback(0,"Preffered Teachers Join Alert Status Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    if(userRole==5){

                        var table = "parentprofile";

                    } else if(userRole==6){ /*student*/

                        var table = "studentprofile";

                    }

                    
                    var updatedata = {
                        "prefferedTeachersJoinAlert": req.body.prefferedTeachersJoinAlert,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": userId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Preffered Teachers Join Alert Status Updated Successfully");
 
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




/*student / parent profile update : messageReceivedAlert*/
router.post('/studentparentprofilemessagereceivedalertupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.messageReceivedAlert==""){

         callback(0,"Message Received Alert Status Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    if(userRole==5){

                        var table = "parentprofile";

                    } else if(userRole==6){ /*student*/

                        var table = "studentprofile";

                    }

                    
                    var updatedata = {
                        "messageReceivedAlert": req.body.messageReceivedAlert,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": userId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Message Received Alert Status Updated Successfully");
 
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





/*student / parent profile update : shortlistedMeAlert*/
router.post('/studentparentprofileshortlistedmealertupdate',function(req, res){

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.shortlistedMeAlert==""){

         callback(0,"Shortlisted Me Alert Status Should Not Be Empty !");

    } else {

         sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    if(userRole==5){

                        var table = "parentprofile";

                    } else if(userRole==6){ /*student*/

                        var table = "studentprofile";

                    }

                    
                    var updatedata = {
                        "shortlistedMeAlert": req.body.shortlistedMeAlert,
                        "updatedOn": dateymd
                    };

                    var condition = { "userId": userId };

                    sharedmodel.dbupdate(table, updatedata, condition)
                        .then(function () {

                            callback(200, "Shortlisted Me Alert Status Updated Successfully");
 
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



/*Teacher profile details : Student or Parent*/
router.post('/studentparentteacherprofiledetails',function(req, res){

    const callback = function(status, message, profileDetails, tuitionCenterFacilities, teacherCourses, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "tuitionCenterFacilities":tuitionCenterFacilities, "teacherCourses":teacherCourses});
    }

     if(req.body.uniqueUserId == ""){

        callback(0, "User Id Should Not Be Empty !", "", "", "");

     } else if(req.body.teacherUniqueUserId == ""){

        callback(0, "Teacher User Id Should Not Be Empty !", "", "", "");

     } else {

          sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
            .then(function (data) {
                if (data.length > 0) {

                    var userId = data[0].userId;

                    sharedmodel.dbGetUserIdfromUuid(req.body.teacherUniqueUserId)
                    .then(function (teacher) {

                        if (teacher.length > 0) {

                            var teacherUserId = teacher[0].userId;

                            var promises = [];

                            promises[0] = commonmodel.getTeacherProfileDetails(userId, teacherUserId);

                            promises[1] = teachermodel.getTeacherTuitionCenterFacilities(teacherUserId);

                            promises[2] = teachermodel.getTeacherCourses(teacherUserId);

                            Promise.all(promises).then(function(teacherData){

                                console.log(teacherData);

                                var teacherProfile = teacherData[0][0];

                                var tuitionCenterFacility = teacherData[1]; 

                                var teacherCourses = teacherData[2];
         
                                callback(200, "Success", teacherProfile, tuitionCenterFacility, teacherCourses); 

                            })
                            .catch(function(err){

                                 console.log(err);
                                 callback(0, "Failed To Get Details !", "", "", "");

                            });


                        } else {

                            callback(0, "Invalid Teacher User !", "", "", "", 404); /*response with 404 header status*/

                        }

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
                callback(0, "Failed To Get Details !", "", "", "", "");

            });
     }

});





/*Teacher profile details : Public Profile Id*/
router.post('/publicteacherprofiledetails',function(req, res){

    const callback = function(status, message, profileDetails, tuitionCenterFacilities, teacherCourses, headerStatus){

        if(headerStatus){ /* header response status */

            res.status(headerStatus);

        }

        res.json({"status":status, "message":message, "profileDetails":profileDetails, "tuitionCenterFacilities":tuitionCenterFacilities, "teacherCourses":teacherCourses});
    }

     if(req.body.teacherProfileId == ""){

        callback(0, "Profile Id Should Not Be Empty !", "", "", "");

     } else {

            teachermodel.dbGetTeacherPublicProfileIdDetails(req.body.teacherProfileId)
            .then(function (teacher) {

                console.log(teacher);

                if (teacher.length > 0) {

                    var teacherUserId = teacher[0].userId;

                    var promises = [];

                    promises[0] = teachermodel.getPublicTeacherProfileDetails(teacherUserId);

                    promises[1] = teachermodel.getTeacherTuitionCenterFacilities(teacherUserId);

                    promises[2] = teachermodel.getTeacherCourses(teacherUserId);

                    Promise.all(promises).then(function(teacherData){

                        console.log(teacherData);

                        var teacherProfile = teacherData[0][0];

                        var tuitionCenterFacility = teacherData[1]; 

                        var teacherCourses = teacherData[2];

                        callback(200, "Success", teacherProfile, tuitionCenterFacility, teacherCourses); 

                    })
                    .catch(function(err){

                         console.log(err);
                         callback(0, "Failed To Get Details !", "", "", "");

                    });


                } else {

                    callback(0, "Invalid Teacher Profile Id !", "", "", "", 404); /*response with 404 header status*/

                }

            })
            .catch(function(err){

                 console.log(err);
                 callback(0, "Failed To Get Details !", "", "", "");

            });
                  
     }

});




/*user delete profile*/
router.post('/userdeleteprofile',function(req, res){ 

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

                    var userRole = data[0].userRole;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    /*Keep Backup Deleting User*/
                    commonmodel.keepBackupDeletingUser(userId)
                    .then(function(backupResult){

                        /*remove user*/
                        var table = "users";

                        var condition = {"userId" : userId};

                         sharedmodel.dbremove(table, condition)
                        .then(function () {

                            callback(200, "Account Deleted");

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

                    callback(0,"Invalid User !");

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0,"Failed To Remove !");

            });

    }

});




/*public : recommendation*/
router.post('/publicrecommendation',function(req, res){ 

    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.recommendUniqueId==""){

         callback(0,"Recommend Id Should Not Be Empty !");

    } else if(req.body.recommendByName==""){

         callback(0,"Name Should Not Be Empty !");

    } else if(req.body.recommendByEmail==""){

         callback(0,"Email Id Should Not Be Empty !");

    } else if(req.body.recommendByPhone==""){

         callback(0,"Phone Should Not Be Empty !");

    } else if(req.body.recommendByMessage==""){

         callback(0,"Message Should Not Be Empty !");

    } else {

        var fields = ["recommendationId","recommendationStatus"];

        var table = "teacherPublicRecommendations";

        var condition1 = {"recommendUniqueId":req.body.recommendUniqueId};

        var condition2 = {"Status":"active"};

         sharedmodel.dbgetdetails2and(fields,table,condition1,condition2)
            .then(function (data) {
                if (data.length > 0) {

                    var recommendationId = data[0].recommendationId;

                    var recommendationStatus = data[0].recommendationStatus;

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    if(recommendationStatus==2){

                        /*response*/
                        callback(0, "Already Recommended !");

                    } else {


                        /*update recommendation*/
                        var updateTable = "teacherPublicRecommendations";

                        var updateData = {

                            "recommendByEmail":req.body.recommendByEmail,

                            "recommendByName":req.body.recommendByName,

                            "recommendByPhone":req.body.recommendByPhone,

                            "recommendByMessage":req.body.recommendByMessage,

                            "recommendationStatus":2,

                            "updatedOn":dateymd

                        };

                        var updateCondition = { "recommendationId": recommendationId}; 

                        sharedmodel.dbupdate(updateTable, updateData, updateCondition)  /*update recommendation*/
                        .then(function(request){

                              callback(200, "Successfully Recommended");   /*response*/

                        })
                        .catch(function(err)
                        {
                                
                            console.log(err);
                            callback(0, "Recommendation Failed !"); /*response*/


                        });

                    }


                } else {

                    callback(0,"Invalid Request !"); /*response*/

                }

            })
            .catch(function(err){

                console.log(err);
                callback(0, "Request Failed !"); /*response*/

            });

    }

});





/*user contact logs*/
router.post('/useractivitylogs',function(req, res){ 

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

                var userRole = data[0].userRole;

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                /*get user activity logs*/
                commonmodel.getUserActivityLogs(userId)
                .then(function(Activities){

                    callback(200, "Success", Activities);/*response*/


                })
                .catch(function(err)
                {
                        
                    console.log(err);
                    callback(0, "Failed To Get Details !", "");

                });


            } else {

                callback(0,"Invalid User !", "");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !", "");

        });

    }

});




/*user Web Push Subscription Update*/
router.post('/userWebPushSubscriptionUpdate',function(req, res){ 

 
    const callback = function(status, message){

        res.json({"status":status, "message":message});
    }

    if(req.body.uniqueUserId==""){

         callback(0,"User Id Should Not Be Empty !");

    } else if(req.body.webPushSubscription==""){

         callback(0,"Web Push Subscription Should Not Be Empty !");

    } else {

        sharedmodel.dbGetUserIdfromUuid(req.body.uniqueUserId)
        .then(function (data) {
            if (data.length > 0) {

                var userId = data[0].userId;

                var userRole = data[0].userRole;

                var dt = datetime.create();

                var dateymd = dt.format('Y-m-d H:M:S');

                var table = "users";

                var updateData = {

                    "webPushSubscription": req.body.webPushSubscription,
                    //"webPushSubscription":'{"endpoint":"https://fcm.googleapis.com/fcm/send/dOr-Z3XbRuI:APA91bEX3S7yRyPHXpOZmNetgC2xeLnKxrG2NtUJ0TndXn8aw15UWSBelg8r67msONTzedNmIZB3nrGbXgPmk_01jR_F69bPzpmC1GKEuhn5l1Buhm9YuyRFuzZgQhxWyaTWClFL_4Ja","expirationTime":null,"keys":{"p256dh":"BHc1F-jHSfaZXCxa2Y6K-Fk_oNdDlORTM6qHXDzebSTq6AD2atgrkT50dlj7Wj_any-QhS7CduCEs0eqeuyOyWY=","auth":"-yrJfSuYUD4J8hvL8RBjFw=="}}',
                    "updatedOn": dateymd

                };

                var updateCondition = { "userId":userId };

                /*update*/
                sharedmodel.dbupdate(table, updateData, updateCondition)
                .then(function(data){

                    callback(200, "Success");/*response*/


                })
                .catch(function(err)
                {
                        
                    console.log(err);
                    callback(0, "Failed To Get Details !");

                });


            } else {

                callback(0,"Invalid User !");

            }

        })
        .catch(function(err){

            console.log(err);
            callback(0, "Failed To Get Details !");

        });

    }

});



/*user profile registration : step1 details*/
router.post('/user-profile-registration-step1-details',function(req, res){

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

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var fileds = ["nickName","Phone","Email"];

                    var table = "users";

                    var condition = { "userId": userId };

                    sharedmodel.dbgetdetails(fileds, table, condition)
                        .then(function (data) {

                            callback(200, "Success", data[0]);
 
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





/*user profile registration : step2 details*/
router.post('/user-profile-registration-step2-details',function(req, res){

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

                    var dt = datetime.create();

                    var dateymd = dt.format('Y-m-d H:M:S');

                    var fileds = ["nickName", "Fname", "Lname", "Gender", "ageGroup", "Address", "Pincode", "Country", "State", "District", "Locality", "Latitude", "Longitude"];

                    var table = "users";

                    var condition = { "userId": userId };

                    sharedmodel.dbgetdetails(fileds, table, condition)
                        .then(function (data) {

                            callback(200, "Success", data[0]);
 
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