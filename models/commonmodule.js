"use strict";
var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');



var commonmodel = {



	/* get Search Suggestions */
	getSearchSuggestions: async function (searchKeyArr)
	{

		console.log(searchKeyArr); 

		/*table fetch - subjectTopicDisplayName - details*/
		var sql = "SELECT DISTINCT(ST.subjectTopicDisplayName)"; 
		
		/*subjecttopics*/
		sql += " FROM subjecttopics AS ST";

		/*left join subjectcategories*/
		sql += " LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId = ST.subjectCategoryId";

		/*left join subjectsubcategories*/
		sql += " LEFT JOIN subjectsubcategories AS SSC ON SSC.subjectSubcategoryId = ST.subjectSubcategoryId";

		/*left join subjectgroups*/
		sql += " LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId = ST.subjectGroupId";

		/*left join subjectsubgroups*/
		sql += " LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId = ST.subjectSubgroupId";

		/*left join subjectclasses*/
		sql += " LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId = ST.subjectClassId"; 


		sql += " WHERE ";

		/*subjectTopicName*/
		sql += "((ST.subjectTopicName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectTopicDisplayName*/
		sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectCategoryName*/
		sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectSubcategoryName*/
		sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectGroupName*/
		sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectSubgroupName*/
		sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectClassName*/
		sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[k]+"%')";

		}
			
		sql += ") AND ST.subjectTopicStatus='active'";

		sql += " GROUP BY ST.subjectTopicId ORDER BY subjectTopicDisplayName ASC";

		console.log(sql);

		return await db.query(sql);

	},



	/* search Result Filter Category Options */
	searchResultFilterCategoryOptions: async function (searchResultSubjectTopicIds)
	{
 
 		var sql = "select SC.subjectCategoryId, SC.subjectCategoryName from subjectTopics AS ST LEFT JOIN subjectCategories AS SC ON ST.subjectCategoryId=SC.subjectCategoryId where ST.subjectTopicId IN ("+searchResultSubjectTopicIds+") GROUP BY SC.subjectCategoryId"; 
		
		console.log(sql); 

		return await db.query(sql);

	},



	/* search Result Filter SubCategory Options */
	searchResultFilterSubCategoryOptions: async function (searchResultSubjectTopicIds, subjectCategoryId)
	{
 
		var sql = "select SSC.subjectSubcategoryId, SSC.subjectSubcategoryName from subjectTopics AS ST LEFT JOIN subjectSubcategories AS SSC ON ST.subjectSubcategoryId = SSC.subjectSubcategoryId where ST.subjectTopicId IN ("+searchResultSubjectTopicIds+") AND ST.subjectCategoryId="+subjectCategoryId+" GROUP BY SSC.subjectSubcategoryId"; 
		
		console.log(sql); 

		return await db.query(sql);

	},




	/* search Result Filter Group Options */
	searchResultFilterGroupOptions: async function (searchResultSubjectTopicIds, subjectSubcategoryId)
	{
 
		var sql = "select SG.subjectGroupId, SG.subjectGroupName from subjectTopics AS ST LEFT JOIN subjectGroups AS SG ON ST.subjectGroupId = SG.subjectGroupId where ST.subjectTopicId IN ("+searchResultSubjectTopicIds+") AND ST.subjectSubcategoryId="+subjectSubcategoryId+" GROUP BY SG.subjectGroupId"; 
		
		console.log(sql); 

		return await db.query(sql);

	},



	/* search Result Filter Subject Options */
	searchResultFilterSubjectOptions: async function (searchResultSubjectTopicIds, subjectGroupId)
	{
 
		var sql = "select ST.subjectTopicId, ST.subjectTopicName from subjectTopics AS ST where ST.subjectTopicId IN ("+searchResultSubjectTopicIds+") AND ST.subjectGroupId="+subjectGroupId+" GROUP BY ST.subjectTopicId"; 
		
		console.log(sql); 

		return await db.query(sql);

	},


	

	/* Landing Page Teachers Search */
	//landingPageTeachersSearch: async function (Latitude, Longitude, searchKeyArr, filterConditionField, filterConditionFieldId, searchResultTeachersSubjectTopicIds)
	landingPageTeachersSearch: async function (Latitude, Longitude, searchKeyArr)
	{

		console.log(searchKeyArr); 

		/*table fetch - users - details*/
		var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country,"; 

		/*table fetch - teacherpfoile - details*/
		sql += " IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.adminRating, '') AS adminRating,"; 

		/*table fetch - tuitioncenters - details*/
		sql += "  IFNULL(TTC.tuitionCenterId, '') AS tuitionCenterId, IFNULL(TTC.tuitionCenterName, '') AS tuitionCenterName, IFNULL(TTC.newAdmissionStatus, '') AS newAdmissionStatus, IFNULL(TTC.freeTuitionWillingness, '') AS freeTuitionWillingness, IFNULL(TTC.tuitionAt, '') AS tuitionAt, IFNULL(TTC.proffessionalTeachingExp, '') AS proffessionalTeachingExp, IFNULL(TTC.homeTuitionExp, '') AS homeTuitionExp, IFNULL(TTC.nonTeachingExp, '') AS nonTeachingExp, IFNULL(TTC.totalStudentsTaught, '') AS totalStudentsTaught,"; 

		/*table fetch - teachersqualifications - details*/
		sql += " IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights,";

		/*table fetch - userTeacherRating - details*/
		sql += " IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating";

		if(Latitude != "" && Longitude != ""){ /*if only have locations*/

			/*distance*/
			sql += ", ( 6373 * acos( cos( radians("+Latitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+Longitude+") ) + sin( radians("+Latitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		}

		
		/*users*/
		sql += " FROM users AS U";

		/*left join teacher deatils fetch tables*/
		sql += " LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TTC ON U.userId=TTC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId";

		/*left join teachercourses*/
		sql += " LEFT JOIN teachercourses AS TC ON TC.teacherUserId = U.userId";
 
		/*left join subjecttopics*/
		sql += " LEFT JOIN subjecttopics AS ST ON ST.subjectTopicId = TC.subjectTopicId";

		/*left join subjectcategories*/
		sql += " LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId = ST.subjectCategoryId";

		/*left join subjectsubcategories*/
		sql += " LEFT JOIN subjectsubcategories AS SSC ON SSC.subjectSubcategoryId = ST.subjectSubcategoryId";

		/*left join subjectgroups*/
		sql += " LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId = ST.subjectGroupId";

		/*left join subjectsubgroups*/
		sql += " LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId = ST.subjectSubgroupId";

		/*left join subjectclasses*/
		sql += " LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId = ST.subjectClassId"; 

		sql += " WHERE ";

		/*Fname*/
		// sql += " WHERE ((U.Fname LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Fname LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Lname*/
		// sql += " OR (U.Lname LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Lname LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*nickName*/
		// sql += " OR (U.nickName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.nickName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*Email*/
		// sql += " OR (U.Email LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Email LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*Phone*/
		// sql += " OR (U.Phone LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Phone LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Pincode*/
		sql += " ((U.Pincode LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Pincode LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Address*/
		// sql += " OR (U.Address LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Address LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Locality*/
		sql += " OR (U.Locality LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Locality LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*District*/
		sql += " OR (U.District LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.District LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*State*/
		// sql += " OR (U.State LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.State LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Country*/
		// sql += " OR (U.Country LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Country LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*tuitionCenterName*/
		// sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*subjectTopicName*/
		sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectTopicDisplayName*/
		sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[k]+"%')";

		}

		// /*subjectCategoryName*/
		// sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*subjectSubcategoryName*/
		sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectGroupName*/
		sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectSubgroupName*/
		sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		// /*subjectClassName*/
		// sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[k]+"%')";

		// }
			
		sql += ") AND U.userRole=4 AND U.Status=1";


		/* filter starts */
		// if(filterConditionField=="subjectCategoryId"){

		// 	//sql += " AND U.userId IN (select TTCC.teacherUserId from teacherCourses AS TTCC LEFT JOIN subjectTopics AS SSTT ON SSTT.subjectTopicId=TTCC.subjectTopicId where TTCC.subjectTopicId IN (1, 2, 3, 4, 12, 22, 43, 60) AND SSTT.subjectCategoryId=1)";
		// 	sql += " AND U.userId IN (select TTCC.teacherUserId from teacherCourses AS TTCC LEFT JOIN subjectTopics AS SSTT ON SSTT.subjectTopicId=TTCC.subjectTopicId where TTCC.subjectTopicId IN ("+searchResultTeachersSubjectTopicIds+") AND SSTT.subjectCategoryId="+filterConditionFieldId+")";

		// }

		// if(filterConditionField=="subjectSubcategoryId"){

		// 	sql += " AND U.userId IN (select TTCC.teacherUserId from teacherCourses AS TTCC LEFT JOIN subjectTopics AS SSTT ON SSTT.subjectTopicId=TTCC.subjectTopicId where TTCC.subjectTopicId IN ("+searchResultTeachersSubjectTopicIds+") AND SSTT.subjectSubcategoryId="+filterConditionFieldId+")";

		// }

		// if(filterConditionField=="subjectGroupId"){

		// 	sql += " AND U.userId IN (select TTCC.teacherUserId from teacherCourses AS TTCC LEFT JOIN subjectTopics AS SSTT ON SSTT.subjectTopicId=TTCC.subjectTopicId where TTCC.subjectTopicId IN ("+searchResultTeachersSubjectTopicIds+") AND SSTT.subjectGroupId="+filterConditionFieldId+")";

		// }

		// if(filterConditionField=="subjectTopicId"){

		// 	sql += " AND U.userId IN (select TTCC.teacherUserId from teacherCourses AS TTCC LEFT JOIN subjectTopics AS SSTT ON SSTT.subjectTopicId=TTCC.subjectTopicId where TTCC.subjectTopicId IN ("+searchResultTeachersSubjectTopicIds+") AND SSTT.subjectTopicId="+filterConditionFieldId+")";

		// }
		/* filter ends */


	    if(Latitude != "" && Longitude != ""){ /*if only have locations*/

			sql += " GROUP BY U.userId HAVING distance < 100 ORDER BY distance";

		} else {

			sql += " GROUP BY U.userId ORDER BY userRating DESC";
		}

		console.log(sql);

		return await db.query(sql);

	},




	/* teachers search by keywords */
	teacherssearchbykeywords: async function (userLongitude, userLatitude, searchKeyArr)
	{

		console.log(searchKeyArr); 

		/*table fetch - users - details*/
		var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country,"; 

		/*table fetch - teacherpfoile - details*/
		sql += " IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.adminRating, '') AS adminRating,"; 

		/*table fetch - tuitioncenters - details*/
		sql += "  IFNULL(TTC.tuitionCenterId, '') AS tuitionCenterId, IFNULL(TTC.tuitionCenterName, '') AS tuitionCenterName, IFNULL(TTC.newAdmissionStatus, '') AS newAdmissionStatus, IFNULL(TTC.freeTuitionWillingness, '') AS freeTuitionWillingness, IFNULL(TTC.tuitionAt, '') AS tuitionAt, IFNULL(TTC.proffessionalTeachingExp, '') AS proffessionalTeachingExp, IFNULL(TTC.homeTuitionExp, '') AS homeTuitionExp, IFNULL(TTC.nonTeachingExp, '') AS nonTeachingExp, IFNULL(TTC.totalStudentsTaught, '') AS totalStudentsTaught,"; 

		/*table fetch - teachersqualifications - details*/
		sql += " IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights,";

		/*table fetch - userTeacherRating - details*/
		sql += " IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating";


		if(userLatitude != "" && userLongitude != ""){ /*if only have locations*/

			/*distance*/
			sql += ", ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		}

		/*distance*/
		//sql += " ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		/*users*/
		sql += " FROM users AS U";

		/*left join teacher deatils fetch tables*/
		sql += " LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TTC ON U.userId=TTC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId";

		/*left join teachercourses*/
		sql += " LEFT JOIN teachercourses AS TC ON TC.teacherUserId = U.userId";
 
		/*left join subjecttopics*/
		sql += " LEFT JOIN subjecttopics AS ST ON ST.subjectTopicId = TC.subjectTopicId";

		/*left join subjectcategories*/
		sql += " LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId = ST.subjectCategoryId";

		/*left join subjectsubcategories*/
		sql += " LEFT JOIN subjectsubcategories AS SSC ON SSC.subjectSubcategoryId = ST.subjectSubcategoryId";

		/*left join subjectgroups*/
		sql += " LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId = ST.subjectGroupId";

		/*left join subjectsubgroups*/
		sql += " LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId = ST.subjectSubgroupId";

		/*left join subjectclasses*/
		sql += " LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId = ST.subjectClassId"; 

		sql += " WHERE ";

		/*Fname*/
		// sql += " WHERE ((U.Fname LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Fname LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Lname*/
		// sql += " OR (U.Lname LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Lname LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*nickName*/
		// sql += " OR (U.nickName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.nickName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*Email*/
		// sql += " OR (U.Email LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Email LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*Phone*/
		// sql += " OR (U.Phone LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Phone LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Pincode*/
		sql += " ((U.Pincode LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Pincode LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Address*/
		// sql += " OR (U.Address LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Address LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Locality*/
		sql += " OR (U.Locality LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Locality LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*District*/
		sql += " OR (U.District LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.District LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*State*/
		// sql += " OR (U.State LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.State LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*Country*/
		// sql += " OR (U.Country LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (U.Country LIKE '%"+searchKeyArr[k]+"%')";

		// }

		/*tuitionCenterName*/
		// sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*subjectTopicName*/
		sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectTopicDisplayName*/
		sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicDisplayName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectCategoryName*/
		// sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[k]+"%')";

		// }


		/*subjectSubcategoryName*/
		sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectGroupName*/
		sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectSubgroupName*/
		sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectClassName*/
		// sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[0]+"%')";

		// for(var k = 1; k < searchKeyArr.length; k++)
		// {

		// 	sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[k]+"%')";

		// }

		sql += ") AND U.userRole=4 AND U.Status=1";


		if(userLatitude != "" && userLongitude != ""){ /*if only have locations*/

			sql += " GROUP BY U.userId HAVING distance < 100 ORDER BY distance";

		} else {

			sql += " GROUP BY U.userId ORDER BY userRating DESC";
		}
			
		//sql += ") AND U.userRole=4 AND U.Status=1 GROUP BY U.userId HAVING distance < 100 ORDER BY distance";


		console.log(sql);

		return await db.query(sql);

	},



	/* teachers search by polygon selection*/
	teacherssearchpolygon: async function (userLongitude, userLatitude, searchKeyArr)
	{

		console.log(searchKeyArr); 

		/*table fetch - users - details*/
		var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country,"; 

		/*table fetch - teacherpfoile - details*/
		sql += " IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.adminRating, '') AS adminRating,"; 

		/*table fetch - tuitioncenters - details*/
		sql += "  IFNULL(TTC.tuitionCenterId, '') AS tuitionCenterId, IFNULL(TTC.tuitionCenterName, '') AS tuitionCenterName, IFNULL(TTC.newAdmissionStatus, '') AS newAdmissionStatus, IFNULL(TTC.freeTuitionWillingness, '') AS freeTuitionWillingness, IFNULL(TTC.tuitionAt, '') AS tuitionAt, IFNULL(TTC.proffessionalTeachingExp, '') AS proffessionalTeachingExp, IFNULL(TTC.homeTuitionExp, '') AS homeTuitionExp, IFNULL(TTC.nonTeachingExp, '') AS nonTeachingExp, IFNULL(TTC.totalStudentsTaught, '') AS totalStudentsTaught,"; 

		/*table fetch - teachersqualifications - details*/
		sql += " IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights,";

		/*table fetch - userTeacherRating - details*/
		sql += " IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating,";

		/*distance*/
		sql += " ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		/*users*/
		sql += " FROM users AS U";

		/*left join teacher deatils fetch tables*/
		sql += " LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TTC ON U.userId=TTC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId";

		/*left join teachercourses*/
		sql += " LEFT JOIN teachercourses AS TC ON TC.teacherUserId = U.userId";
 
		/*left join subjecttopics*/
		sql += " LEFT JOIN subjecttopics AS ST ON ST.subjectTopicId = TC.subjectTopicId";

		/*left join subjectcategories*/
		sql += " LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId = ST.subjectCategoryId";

		/*left join subjectsubcategories*/
		sql += " LEFT JOIN subjectsubcategories AS SSC ON SSC.subjectSubcategoryId = ST.subjectSubcategoryId";

		/*left join subjectgroups*/
		sql += " LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId = ST.subjectGroupId";

		/*left join subjectsubgroups*/
		sql += " LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId = ST.subjectSubgroupId";

		/*left join subjectclasses*/
		sql += " LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId = ST.subjectClassId"; 

		/*Fname*/
		sql += " WHERE ((U.Fname LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Fname LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Lname*/
		sql += " OR (U.Lname LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Lname LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*nickName*/
		sql += " OR (U.nickName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.nickName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*Email*/
		sql += " OR (U.Email LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Email LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*Phone*/
		sql += " OR (U.Phone LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Phone LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Pincode*/
		sql += " OR (U.Pincode LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Pincode LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Address*/
		sql += " OR (U.Address LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Address LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Locality*/
		sql += " OR (U.Locality LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Locality LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*District*/
		sql += " OR (U.District LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.District LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*State*/
		sql += " OR (U.State LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.State LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*Country*/
		sql += " OR (U.Country LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (U.Country LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*tuitionCenterName*/
		sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (TTC.tuitionCenterName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectTopicName*/
		sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (ST.subjectTopicName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectCategoryName*/
		sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SC.subjectCategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectSubcategoryName*/
		sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSC.subjectSubcategoryName LIKE '%"+searchKeyArr[k]+"%')";

		}


		/*subjectGroupName*/
		sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SG.subjectGroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectSubgroupName*/
		sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SSG.subjectSubgroupName LIKE '%"+searchKeyArr[k]+"%')";

		}

		/*subjectClassName*/
		sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[0]+"%')";

		for(var k = 1; k < searchKeyArr.length; k++)
		{

			sql += " OR (SCL.subjectClassName LIKE '%"+searchKeyArr[k]+"%')";

		}
			
		sql += ") AND U.userRole=4 AND U.Status=1 GROUP BY U.userId HAVING distance < 100 ORDER BY distance";


		console.log(sql);

		return await db.query(sql);

	},




	/*get Student/Parent Viewed Teachers*/
    getStudentParentViewedTeachers : async function (contactUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE (TSPC.contactUserAction=1) AND U.Status=1 AND TSPC.Status='active' AND TSPC.contactUserId="+contactUserId;
        return await db.query(sql);

    },

    /*get  Student/Parent Contacted Teachers*/
    getStudentParentContactedTeachers : async function (contactUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE (TSPC.contactUserAction=2) AND U.Status=1 AND TSPC.Status='active' AND TSPC.contactUserId="+contactUserId;
        return await db.query(sql);

    },

     /*get  Student/Parent Shortlisted Teachers*/
    getStudentParentShortlistedTeachers : async function (contactUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE (TSPC.contactUserAction=3) AND U.Status=1 AND TSPC.Status='active' AND TSPC.contactUserId="+contactUserId;
        return await db.query(sql);

    },

    /*get Student/Parent Admission Requested Teachers*/
    getStudentParentAdmissionRequestedTeachers : async function (contactUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE (TSPC.contactUserAction=4) AND U.Status=1 AND TSPC.Status='active' AND TSPC.contactUserId="+contactUserId;
        return await db.query(sql);

    },

     /*get Student/Parent Admited Teachers*/
    getStudentParentAdmitedTeachers : async function (contactUserId){

        var sql ="select U.Fname, IFNULL(U.Lname, '') AS Lname from teacherstudentparentcontacts AS TSPC LEFT JOIN users AS U ON TSPC.teacherUserId = U.userId WHERE (TSPC.teacherAction=4) AND U.Status=1 AND TSPC.Status='active' AND TSPC.contactUserId="+contactUserId;
        return await db.query(sql);

    },


    /*get StudentParent Courses */
    getStudentParentCourses: async function (contactUserId){

        var sql = "select ST.subjectTopicId, ST.subjectTopicName, SC.subjectCategoryId, SC.subjectCategoryName, IFNULL(SSB.subjectSubcategoryId,'') AS subjectSubcategoryId, IFNULL(SSB.subjectSubcategoryName,'') AS subjectSubcategoryName, IFNULL(SG.subjectGroupId,'') AS subjectGroupId, IFNULL(SG.subjectGroupName,'') AS subjectGroupName, IFNULL(SSG.subjectSubgroupId,'') AS subjectSubgroupId, IFNULL(SSG.subjectSubgroupName,'') AS subjectSubgroupName, IFNULL(SCL.subjectClassId,'') AS subjectClassId, IFNULL(SCL.subjectClassName,'') AS subjectClassName from studentcourses AS SPC LEFT JOIN subjecttopics AS ST ON SPC.subjectTopicId=ST.subjectTopicId LEFT JOIN subjectcategories AS SC ON SC.subjectCategoryId=ST.subjectCategoryId LEFT JOIN subjectsubcategories AS SSB ON SSB.subjectSubcategoryId=ST.subjectSubcategoryId LEFT JOIN subjectgroups AS SG ON SG.subjectGroupId=ST.subjectGroupId LEFT JOIN subjectsubgroups AS SSG ON SSG.subjectSubgroupId=ST.subjectSubgroupId LEFT JOIN subjectclasses AS SCL ON SCL.subjectClassId=ST.subjectClassId WHERE SPC.studentUserId="+contactUserId+" AND ST.subjectTopicStatus='active'";
        return await db.query(sql);

    },

    /*get StudentParent Course Teachers In Contact Viewed*/
    getStudentParentCourseTeachersInContactViewed : async function (contactUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from teachercourses AS TC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.teacherUserId = TC.teacherUserId LEFT JOIN users AS U ON U.userId = TSPC.teacherUserId WHERE TSPC.contactUserAction=1 AND TSPC.contactUserId="+contactUserId+" AND TC.subjectTopicId="+subjectTopicId+" AND TC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },

    /*get StudentParent Course Teachers In Contact Contacted*/
    getStudentParentCourseTeachersInContactContacted : async function (contactUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from teachercourses AS TC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.teacherUserId = TC.teacherUserId LEFT JOIN users AS U ON U.userId = TSPC.teacherUserId WHERE TSPC.contactUserAction=2 AND TSPC.contactUserId="+contactUserId+" AND TC.subjectTopicId="+subjectTopicId+" AND TC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);
 
    },

    /*get StudentParent Course Teachers In Contact Shortlisted*/
    getStudentParentCourseTeachersInContactShortlisted : async function (contactUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from teachercourses AS TC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.teacherUserId = TC.teacherUserId LEFT JOIN users AS U ON U.userId = TSPC.teacherUserId WHERE TSPC.contactUserAction=3 AND TSPC.contactUserId="+contactUserId+" AND TC.subjectTopicId="+subjectTopicId+" AND TC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },

    
     /*get StudentParent Course Teachers In Contact Admited*/
    getStudentParentCourseTeachersInContactAdmited : async function (contactUserId, subjectTopicId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname, '') AS Lname, U.nickName, U.Email, U.Gender, U.Phone, U.userRole, U.profilePic, U.Gender, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, TSPC.ContactId, TSPC.contactUserAction, TSPC.contactUserAction, TSPC.flagInappropriateStatus, TSPC.contactRevealedStatus from teachercourses AS TC LEFT JOIN teacherstudentparentcontacts AS TSPC ON TSPC.teacherUserId = TC.teacherUserId LEFT JOIN users AS U ON U.userId = TSPC.teacherUserId WHERE TSPC.teacherAction=4 AND TSPC.contactUserId="+contactUserId+" AND TC.subjectTopicId="+subjectTopicId+" AND TC.Status=1 AND U.Status=1 AND TSPC.Status='active'";
        return await db.query(sql);

    },


    /* nearby 10 km teachers */
	getNearbyTeachersDetails: async function (userLongitude, userLatitude, teacherUserId)
	{

		/*table fetch - users - details*/
		var sql = "SELECT U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.Longitude, U.Latitude,"; 

		/*table fetch - teacherpfoile - details*/
		sql += " IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.adminRating, '') AS adminRating, IFNULL(TP.customText, '') AS customText, "; 

		/*distance*/
		sql += " ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		/*users*/
		sql += " FROM users AS U";

		/*left join teacher deatils fetch tables*/
		sql += " LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId";
			
		sql += " WHERE";

		if(teacherUserId!=""){

			sql += " U.userId!="+teacherUserId+" AND"; /*get except userId users*/

		}

		sql += " U.userRole=4 AND U.Status=1 GROUP BY U.userId HAVING distance < 10 ORDER BY distance";

		return await db.query(sql);

	},

	/* nearby 10 km parents */
	getNearbyParentsDetails: async function (userLongitude, userLatitude, userId)
	{

		/*table fetch - users - details*/
		var sql = "SELECT U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.Longitude, U.Latitude,"; 

		/*distance*/
		sql += " ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		/*users*/
		sql += " FROM users AS U";

		sql += " WHERE";

		if(userId!=""){

			sql += " U.userId!="+userId+" AND"; /*get except userId users*/

		}
			
		sql += " U.userRole=5 AND U.Status=1 GROUP BY U.userId HAVING distance < 10 ORDER BY distance";

		return await db.query(sql);

	},

	/* nearby 10 km students */
	getNearbyStudentsDetails: async function (userLongitude, userLatitude, userId)
	{

		/*table fetch - users - details*/
		var sql = "SELECT U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.profilePic, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.Longitude, U.Latitude,"; 

		/*distance*/
		sql += " ( 6373 * acos( cos( radians("+userLatitude+") ) * cos( radians( Latitude ) ) * cos( radians( Longitude ) - radians("+userLongitude+") ) + sin( radians("+userLatitude+") ) * sin( radians( Latitude ) ) ) ) AS distance";

		/*users*/
		sql += " FROM users AS U";

		sql += " WHERE";

		if(userId!=""){

			sql += " U.userId!="+userId+" AND"; /*get except userId users*/

		}
			
		sql += " U.userRole=6 AND U.Status=1 GROUP BY U.userId HAVING distance < 10 ORDER BY distance";

		return await db.query(sql);

	},

	/*getUsersUnreadMessageDetails*/
	getUsersUnreadMessageDetails: async function (userId)
	{

		/*message - details*/
		var sql = " select * from usermessages where receiverUserId="+userId+" AND messageStatus='unread' AND Status='active'";

		return await db.query(sql);

	}, 

	/*getUsersUnreadChatMessageDetails*/
	getUsersUnreadChatMessageDetails: async function (userId)
	{

		/*chat - details*/
		var sql = "select * from userchats where receiverUserId="+userId+" AND chatStatus='unread' AND Status='active'";

		return await db.query(sql);

	},


	/*get Current Month Record User Revealed Contacts*/
	getCurrentMonthRecordUserRevealedContacts: async function (userId)
	{

		/*contact revealed - details*/
		var sql = "SELECT * FROM teacherstudentparentcontacts WHERE YEAR(contactRevealedDate) = YEAR(CURRENT_DATE) AND MONTH(contactRevealedDate) = MONTH(CURRENT_DATE) AND contactRevealedStatus=1 AND Status='active' AND contactUserId="+userId;

		return await db.query(sql);

	},


  /* getTeacherProfileDetails */
    getTeacherProfileDetails: async function (userId, teacherUserId){

        var sql ="select U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName";

        sql += ", IFNULL((SELECT IF(TSBC.contactRevealedStatus=1, U.Phone, 'Contact Not Revealed') FROM teacherstudentparentcontacts AS TSBC WHERE TSBC.teacherUserId="+teacherUserId+" AND TSBC.contactUserId="+userId+" AND TSBC.Status='active'), 'Contact Not Revealed') AS revealedPhone"; /*get & check contact revealed status and send phone*/
       
        sql += ", IFNULL((SELECT IF(TSBC.contactRevealedStatus=1,U.Email,'Contact Not Revealed') FROM teacherstudentparentcontacts AS TSBC WHERE TSBC.teacherUserId="+teacherUserId+" AND TSBC.contactUserId="+userId+" AND TSBC.Status='active'), 'Contact Not Revealed') AS revealedEmail"; /*get & check contact revealed status and send email*/
        
        sql += ", IFNULL((SELECT contactUserAction FROM teacherstudentparentcontacts AS TSBC WHERE TSBC.teacherUserId="+teacherUserId+" AND TSBC.contactUserId="+userId+" AND TSBC.Status='active'), '0') AS contactUserAction"; /*get contactUserAction on teacher*/

        sql += ", U.Gender, U.userRole, U.phoneVerified, U.emailVerified, U.profilePic, U.Longitude, U.Latitude, U.Pincode, U.Address, U.Locality, U.District, U.State, U.Country, U.createdOn, U.Status, IFNULL(TP.profileId, '') AS profileId, IFNULL(TP.aadhaarNumber, '') AS aadhaarNumber, IFNULL(TP.customText, '') AS customText, TP.snoozeAlertStatus, TP.snoozedDateTime, TP.snoozeEndDate, TP.helpAKidInterest, TP.refferedBy, TP.otherCredentials, IFNULL(TP.adminRating, '') AS adminRating, TP.alertType, TP.alertInterval, TP.alertParentStudentRespond, TP.alertStudentJoinInterest, TP.alertKidFreeTeachRequest, TP.alertBusinessImproveNotification";

        sql += ", TC.tuitionCenterId, IFNULL(TC.tuitionCenterName, '') AS tuitionCenterName, TC.newAdmissionStatus, TC.freeTuitionWillingness, TC.tuitionAt, TC.proffessionalTeachingExp, TC.homeTuitionExp, TC.nonTeachingExp,TC.totalStudentsTaught, IFNULL(TQ.topDegree,'') AS topDegree, IFNULL(TQ.otherDegree,'') AS otherDegree, IFNULL(TQ.Certifications,'') AS Certifications, IFNULL(TQ.Highlights,'') AS Highlights, IFNULL(ROUND(avg(TR.Rating),1), 0) AS userRating FROM users AS U LEFT JOIN teacherprofile AS TP ON U.userId=TP.userId LEFT JOIN tuitioncenters AS TC ON U.userId=TC.teacherUserId LEFT JOIN teachersqualifications AS TQ ON U.userId=TQ.teacherUserId LEFT JOIN userTeacherRating AS TR ON U.userId=TR.teacherUserId"; 

        sql += " WHERE U.userId = "+teacherUserId;

        return await db.query(sql); 

    },
 
	

	/*Keep Backup Deleting User*/
	keepBackupDeletingUser: async function (userId)
	{

		var sql = "INSERT INTO usersdeleted (`userId`,`uniqueUserId`,`Fname`,`Lname`,`Email`,`Password`,`userToken`,`otp`,`otpGenTime`,`otpExpTime`,`Gender`,`Phone`,`userRole`,`phoneVerified`,`emailVerified`,`emailVerifyCode`,`profilePic`,`Longitude`,`Latitude`,`Pincode`,`Address`,`Locality`,`District`,`State`,`Country`,`createdOn`,`Status`,`updatedOn`)";
		
		sql += " SELECT `userId`,`uniqueUserId`,`Fname`,`Lname`,`Email`,`Password`,`userToken`,`otp`,`otpGenTime`,`otpExpTime`,`Gender`,`Phone`,`userRole`,`phoneVerified`,`emailVerified`,`emailVerifyCode`,`profilePic`,`Longitude`,`Latitude`,`Pincode`,`Address`,`Locality`,`District`,`State`,`Country`,`createdOn`,`Status`,`updatedOn`";
		
		sql += " FROM users where userId="+userId;
		
		return await db.query(sql);

	},


	/*get User Activity Logs*/
	getUserActivityLogs: async function (userId)
	{

		var sql = "SELECT contactLogId, Action, createdOn FROM contactlogs WHERE actionUserId="+userId+" ORDER BY createdOn DESC"; 
		
		return await db.query(sql);

	},


	/*check email exists for others or not*/
    emailExistsForOthersCheck: async function (userId, email) {
        return await db.query("SELECT * FROM users WHERE Email = ? AND userId != ?", [email, userId]);
    },

    /*check phone number exists for others or not*/
    phoneExistsForOthersCheck: async function (userId, phone) {
        return await db.query("SELECT * FROM users WHERE Phone = ? AND userId != ?", [phone, userId]);
    },


}

module.exports = commonmodel;

