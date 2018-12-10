  	var db = require('../../config/db');
	var mysql = require('mysql');
	var datetime = require('node-datetime');

var agentuserexports = {

	/*getAgentTeachersList*/
    getAgentTeachersList: async function (agentUserId) {
        var sql = "SELECT U.userId, U.uniqueUserId, U.Fname, IFNULL(U.Lname,'') AS Lname, U.nickName, U.Email, U.Phone, U.userRole, U.phoneVerified, U.emailVerified, U.Address, U.lastLoggedIn, U.Status, U.updatedOn, TC.tuitionCenterName, AT.joinStatus, AT.managerStatus, IFNULL(MU.Fname,'') AS reviewedByMangerFname, IFNULL(MU.Lname,'') AS reviewedByMangerLname, AT.agentComment FROM agentteachers AS AT LEFT JOIN users AS U ON AT.teacherUserId=U.userId LEFT JOIN tuitioncenters AS TC ON TC.teacherUserId = AT.teacherUserId LEFT JOIN users AS MU ON MU.userId = AT.reviewedBy WHERE AT.agentUserID=? ORDER BY AT.createdOn DESC";
        var inputs = [agentUserId];
        var format = mysql.format(sql, inputs);
        return await db.query(format);
    },

    

}


module.exports = agentuserexports; 

