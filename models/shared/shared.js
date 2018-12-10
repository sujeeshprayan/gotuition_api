var db = require('../../config/db');
var mysql=require('mysql');

var sharemodel = {



    dbGetUserIdfromUuid: async function(uniqueUserId) {
        return await db.query("SELECT * FROM users WHERE uniqueUserId=?", [uniqueUserId]);
    },

    dbgetdetails: async function(fields,table,condition){
        var sql="SELECT ?? FROM ?? WHERE ?";
        var inputs=[fields,table,condition]; 
        var format=mysql.format(sql,inputs);
        console.log(format); 
        return await db.query(format);
    },

    dbgetdetails2and: async function(fields,table,condition1,condition2){
        var sql="SELECT ?? FROM ?? WHERE ? AND ?";
        var inputs=[fields,table,condition1,condition2]; 
        var format=mysql.format(sql,inputs);
        return await db.query(format);
    },

    dbupdate: async function(table,updatdata,condition) {
        var sql = "UPDATE ?? SET ? WHERE ?";
        var inputs = [table,updatdata,condition];
        var format = mysql.format(sql,inputs);
        console.log(format);
        return await db.query(format);
    },

    dbinsert:async function(table,insertdata){
        var sql="INSERT ?? SET ?";
        var inputs=[table,insertdata];
        var format=mysql.format(sql,inputs);
        return await db.query(format);
    },

    dbremove:async function(table,condition){
        var sql="DELETE FROM ?? WHERE ?";
        var inputs=[table,condition];
        var format=mysql.format(sql,inputs);
        console.log(format);
        return await db.query(format);
    },

    dbremove2and:async function(table, condition1, condition2){
        var sql='DELETE FROM ?? WHERE ? AND ?';
        var inputs=[table, condition1, condition2];
        var format=mysql.format(sql,inputs);
        return await db.query(format);
    },

    getadminemail:async function(){
        return await db.query("SELECT Email FROM users WHERE userId=1");
    }


}

module.exports = sharemodel;