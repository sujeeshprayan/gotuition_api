var db = require('../config/db');
var mysql = require('mysql');


var subjects = {

    /*get subject categories*/
    dbgetsubjectcategories: function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=?";
        var inputs = [["subjectCategoryId", "subjectCategoryName", "haveSubcategory", "haveGroup", "haveSubgroup", "haveClass", "haveTopic"], "subjectcategories", "subjectCategoryStatus", "active"];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to get details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },



    /*subject subcategories*/
    dbgetsubjectsubcategories: function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectSubcategoryId", "subjectSubcategoryName", "haveGroup", "haveSubgroup", "haveClass", "haveTopic"], "subjectsubcategories", "subjectCategoryId", reqdata.subjectcategoryId, "subjectSubcategoryStatus", "active"];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to get details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },



    /*subject category groups*/
    dbgetsubjectcategorygroups: function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectGroupId", "subjectGroupName", "haveSubgroup", "haveClass", "haveTopic"], "subjectgroups", reqdata.categoryGroupRequestField, reqdata.categoryGroupRequestFieldId, "subjectGroupStatus", "active"];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to get details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },

    /*subject subgroups*/
    dbgetsubjectsubgroups: function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectSubgroupId", "subjectSubgroupName", "haveClass", "haveTopic"], "subjectsubgroups", reqdata.subGroupRequestField, reqdata.subGroupRequestFieldId, "subjectSubgroupStatus", "active"];
        var format = mysql.format(sql, inputs);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to get details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },

    /*subject classes*/
    dbgetsubjectclasses: async function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectClassId", "subjectClassName", "haveTopic"], "subjectclasses", reqdata.subjectClassRequestField, reqdata.subjectClassRequestFieldId, "subjectClassStatus", "active"];
        var format = mysql.format(sql, inputs);
       // console.log(format);
        return await db.query(format);
    },


    dbgetsubjecttopicsbyclass: async function (subjectClassId) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectTopicId", "subjectTopicName"], "subjecttopics", "subjectClassId", subjectClassId, "subjectTopicStatus", "active"];
        var format = mysql.format(sql, inputs);
       // console.log(format);
        return await db.query(format);

    },
 
    /*subject Topics*/
    dbgetsubjecttopics: function (reqdata, callback) {
        var sql = "SELECT ?? FROM ?? WHERE ??=? AND ??=?";
        var inputs = [["subjectTopicId", "subjectTopicName"], "subjecttopics", reqdata.subjectTopicRequestField, reqdata.subjectTopicRequestFieldId, "subjectTopicStatus", "active"];
        var format = mysql.format(sql, inputs);
        console.log(format);
        db.query(format, function (err, data, fields) {
            if (err) {
                console.log(err);
                callback(0, "Failed to get details !", "");
            }
            else {
                callback(200, "Success", data);
            }
        });
    },










}

module.exports = subjects;
