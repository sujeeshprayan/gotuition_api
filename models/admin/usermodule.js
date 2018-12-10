  	var db = require('../../config/db');
	var mysql = require('mysql');
	var datetime = require('node-datetime');

var adminuserexports = {

	/*user login*/
    dbuserlogin: async function (logindata) {
        var sql = "SELECT userId,uniqueUserId,Fname,IFNULL(Lname,'') AS Lname,nickName,Email,Password,userToken,Gender,Phone,userRole,phoneVerified,emailVerified,Longitude,Latitude,Address,lastLoggedIn,Status,updatedOn FROM ?? WHERE ((??=?) OR (??=?))";
        var inputs = ["users", "Email", logindata.Username, "Phone", logindata.Username];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

   /*get all users list*/
    dbgetallusers: async function () { 
        var sql = "SELECT userId,uniqueUserId,Fname,IFNULL(Lname,'') AS Lname,nickName,Email,Password,userToken,Gender,Phone,userRole,phoneVerified,emailVerified,Longitude,Latitude,Address,lastLoggedIn,Status,updatedOn FROM ?? WHERE ??!=? ORDER BY ?? DESC";
        var inputs = ["users", "userRole", 1, "createdOn"];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*get Manager Agent User Details*/
    getManagerAgentUserDetails: async function (userId) { 
        var sql = "SELECT userId, uniqueUserId, Fname, IFNULL(Lname,'') AS Lname, nickName, Email, Phone, userRole, Address, Pincode, updatedOn FROM ?? WHERE ??=?";
        var inputs = ["users", "userId", userId];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*Get Users By Roles*/
    dbGetUsersByRoles: async function (requestUserRole) { 
        var sql = "SELECT userId,uniqueUserId,Fname,IFNULL(Lname,'') AS Lname,nickName,Email,Password,userToken,Gender,Phone,userRole,phoneVerified,emailVerified,Longitude,Latitude,Address,lastLoggedIn,Status,updatedOn FROM ?? WHERE ??=? ORDER BY ?? DESC";
        var inputs = ["users", "userRole", requestUserRole, "createdOn"];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

     /*execute Admin Queries */
    executeAdminQueries: async function (sqlQuery) { 

        console.log(sqlQuery);
        return await db.query(sqlQuery);
    },

  /*get Total Users Count By Role*/
    getTotalUserCountByRole: async function (requestUserRole) { 
        var sql = "SELECT count(*) AS totalUsers FROM ?? WHERE ?? = ?";
        var inputs = ["users", "userRole", requestUserRole];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*get total Registration Today*/
    totalRegistrationToday: async function (date_ymd) { 
        var sql = "SELECT count(*) AS totalRegistrationToday FROM ?? WHERE ?? LIKE ? AND (userRole=4 OR userRole=5 OR userRole=6)";
        var inputs = ["users", "createdOn", date_ymd+"%"];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },
    

     /*get total Login Today*/
    totalLoginToday: async function (date_ymd) { 
        var sql = "SELECT count(*) AS totalLoginToday FROM ?? WHERE ?? LIKE ? AND (userRole=4 OR userRole=5 OR userRole=6)";
        var inputs = ["users", "lastLoggedIn", date_ymd+"%"];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

}


module.exports = adminuserexports; 

