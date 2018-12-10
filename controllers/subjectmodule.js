var express = require('express');
var router = express.Router();
var db = require('../config/db');
var subjectmodel = require('../models/subjectmodule');


/*subject categories*/
router.post('/subjectcategories', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectcategories": details });
    }

    if (req.body.subjectcategoryreq == "01") {
        subjectmodel.dbgetsubjectcategories(req.body, callback);
    }
    else {
        callback(0, "Invalid Request !", "");
    }
});

/*subject sub categories*/
router.post('/subjectsubcategories', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubcategories": details });
    }


    if (req.body.categorysubcatreq != "012") {
        callback(0, "Invalid Request !", "");
    }
    else if (req.body.subjectcategoryId == "") {
        callback(0, "Subject Category Id Is Empty!", "");
    }
    else {
        subjectmodel.dbgetsubjectsubcategories(req.body, callback);
    }

});


/*subject category groups*/
router.post('/subjectcategorygroups', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectgroups": details });
    }

    if (req.body.categoryGroupReq != "013") {
        callback(0, "Invalid Request !", "");
    }
    else if (req.body.categoryGroupRequestField == "") {
        callback(0, "Request Field Is Empty!", "");
    }
    else if (req.body.categoryGroupRequestFieldId == "") {
        callback(0, "Request Field Id Is Empty!", "");
    }
    else {
        subjectmodel.dbgetsubjectcategorygroups(req.body, callback);
    }

});





/*subject subgroups*/
router.post('/subjectsubgroups', function (req, res) {
    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectsubgroups": details });
    }

    if (req.body.subGroupReq != "014") {
        callback(0, "Invalid Request !", "");
    }
    else if (req.body.subGroupRequestField == "") {
        callback(0, "Request Field Is Empty!", "");
    }
    else if (req.body.subGroupRequestFieldId == "") {
        callback(0, "Request Field Id Is Empty!", "");
    }
    else {
        subjectmodel.dbgetsubjectsubgroups(req.body, callback);
    }

});


/*subject classes*/
router.post('/subjectclasses', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjectclasses": details });
    }

    if (req.body.subjectClassReq != "015") {
        callback(0, "Invalid Request !", "");
    }
    else if (req.body.subjectClassRequestField == "") {
        callback(0, "Request Field Is Empty!", "");
    }
    else if (req.body.subjectClassRequestFieldId == "") {
        callback(0, "Request Field Id Is Empty!", "");
    }
    else {

        var c = 1;
        subjectmodel.dbgetsubjectclasses(req.body)
            .then(function (data) {
              if(data.length > 0){
                    data.forEach(function (item, index, array) {
                    var subjectClassId = item.subjectClassId;
                    // console.log(subjectClassId);
                    subjectmodel.dbgetsubjecttopicsbyclass(subjectClassId)
                        .then(function (Topics) {
                            item.Topics = Topics;
                            if (c == data.length) {
                                /*if execute all indexes in foreach*/
                                callback(200, "Success", data);
                            }

                            c++;
                        })
                          .catch(function (err) {
                           // callback(0, "Request Failed !", "");
                            console.log(err);
                        })

                }); 

              } else {

                callback(0,"No details !","");

              }
            
            })
            .catch(function (err) {
                callback(0, "Request Failed !", "");
                console.log(err);
            })
    } 

});


/*subject Topics*/
router.post('/subjecttopics', function (req, res) {

    const callback = (status, message, details) => {
        res.json({ "status": status, "message": message, "subjecttopics": details });
    }

    if (req.body.subjectTopicReq != "016") {
        callback(0, "Invalid Request !", "");
    }
    else if (req.body.subjectTopicRequestField == "") {
        callback(0, "Request Field Is Empty!", "");
    }
    else if (req.body.subjectTopicRequestFieldId == "") {
        callback(0, "Request Field Id Is Empty!", "");
    }
    else {
        subjectmodel.dbgetsubjecttopics(req.body, callback);
    }

});



module.exports = router;
