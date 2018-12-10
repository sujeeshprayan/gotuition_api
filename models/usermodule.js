var db = require('../config/db');
var mysql = require('mysql');
var datetime = require('node-datetime');


var userexports = {
    /*user insert model function*/
    insertuser: async function (user, callback) {
        //console.log(user); 
        return await db.query("INSERT INTO users SET ?", { uniqueUserId: user.uniqueUserId, Fname: user.nickName, nickName: user.nickName, Email: user.Email, Phone: user.Phone, userToken: user.userToken, otp: user.otp, otpGenTime: user.otpGenTime, otpExpTime: user.otpExpTime, userRole: user.userRole, phoneVerified: 0, emailVerified: 0, emailVerifyCode: user.emailVerifyCode, createdOn: user.createdOn, Status: 0, updatedOn: user.updatedOn });
    },

    /*check email exists or not*/
    emailexistcheck: async function (email) {
        return await db.query("SELECT * FROM users WHERE Email=?", [email]);
    },

    /*check phone number exists or not*/
    phoneexistcheck: async function (phone) {
        return await db.query("SELECT * FROM users WHERE Phone=?", [phone]);
    },

    /*checkuserotp*/
    dbcheckuserotp: async function (otpdata, otpcallback) {

        var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?";
        var inputs = ["users", "otp", otpdata.otp, "uniqueUserId", otpdata.uuId];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*email verification*/
    dbemailverification: async function (emaildata) {
        var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?";
        var inputs = ["users", "uniqueUserId", emaildata.uniqueUserId, "emailVerifyCode", emaildata.emailVerifyCode];
        var format = mysql.format(sql, inputs);
        return await db.query(format);

    },

    /*user login*/
    dbuserlogin: async function (logindata) {
        var sql = "SELECT userId,uniqueUserId,Fname,IFNULL(Lname,'') AS Lname,nickName,Email,Password,userToken,Gender,Phone,userRole,phoneVerified,emailVerified,Longitude,Latitude,Address,lastLoggedIn,Status,updatedOn FROM ?? WHERE ((??=?) OR (??=?))";
        var inputs = ["users", "Email", logindata.Username, "Phone", logindata.Username];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },


    /*forgot password request*/
    dbforgotpasswordrequest: async function (userdata) {
        var sql = "SELECT * FROM ?? WHERE ??=?";
        var inputs = ["users", "Phone", userdata.Phone];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*reset password request*/
    dbresetpasswordrequest: async function (userdata) {
        var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?";
        var inputs = ["users", "uniqueUserId", userdata.uniqueUserId, "Phone", userdata.Phone];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*update new password*/
    dbupdatepassword: async function (userdata) {
        var sql = "UPDATE ?? SET ? WHERE ?";
        var inputs = ["users", { "Password": userdata.passwordHash }, { "userId": userdata.userId }];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    /*pincode details*/
    dbgetpincodedetails: function (req, callback) {
        var sql = "SELECT CONCAT(Pincode,' - ',postOfficeName) AS pincodePost, ?? FROM ?? WHERE ?? LIKE ?";
        var inputs = [["postOfficeName","Pincode","City","District","State","Country"],"pincodes", "Pincode", req.Pincode + '%'];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to retrieve pincode details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },


}

module.exports = userexports;