'use strict';
var express = require('express');
var router = express.Router();
var sharemodel = require('../../models/shared/shared');
var request = require('request');
var sendmail = require('sendmail')();
var fs = require("fs");
var mkdirp = require('mkdirp');
var formidable = require("formidable");
var _ = require('lodash');
var datetime = require('node-datetime');
var mv = require('mv');
var webpush = require('web-push');



var shareexports = {

    /*Get UserId from UuiqueUserid*/
    GetUserIdfromUuid: function (uniqueUserId) {
        var user = sharemodel.dbGetUserIdfromUuid(uniqueUserId);
        return user;
    },

    /*send sms*/
    sendsms: function (phone, message) {
        request({
            uri: 'http://api.msg91.com/api/sendhttp.php?sender=MyTech&route=4&mobiles=' + phone + '&authkey=215853AExTMvBEm85afd1900&country=91&message=' + message + '&campaign=OTP',
            function(error, response, body) {
                console.log(response);
                if (!error && response.statusCode === 200) {
                    console.log(body);
                }
            }
        });
    },

    /*send email*/
    sendemail: function (from, to, subject, data) {


        var baseurl = shareexports.getbaseurl();

        var EmailData ='<html>';
        EmailData +='<head>';
        EmailData +='<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
        EmailData +='<title>Go Tuition</title>';
        EmailData +='</head>';
        EmailData +='<body>';
        EmailData +='<table width="700" align="center" cellpadding="0" cellspacing="0" height="70">';
        EmailData +='<tbody>';
        EmailData +='<tr>';
        EmailData +='<td style=" text-align:left;background: #d3f3ff;padding:10px;"><a href="'+baseurl+'"><img src="'+baseurl+'"/assets/outer/images/logo.png" alt="GoTuition Logo"></a></td>';
        EmailData +='<td style="font-size:20px;font-family:Arial;font-weight:100; line-height:20px; text-align:right; text-transform:uppercase;background: #d3f3ff;padding:10px;"></td>';
        EmailData +='</tr>';
        EmailData +='</tbody>';
        EmailData +='</table>';
        EmailData +='<table width="700" align="center">';
        EmailData +='<tbody>';
        EmailData +='<tr>';
        EmailData +='<td style="font-size:15px;color:#333333;font-weight:bold;font-family:Calibri;background: #fef7e8">';
        EmailData +='<br>';
        EmailData +='<div style="font-size:14px;font-family:Arial;font-weight:100; line-height:22px; margin: 0 10px;">';
        EmailData += data;  /*data from method*/
        EmailData +='</br>';
        EmailData +='</br>';
        EmailData +='</div>';
        EmailData +='</td>';
        EmailData +='</tr>';
        EmailData +='</tbody>';
        EmailData +='</table>';
        EmailData +='<table width="600" align="center" cellpadding="0" cellspacing="0" height="61" style="background: #cccccc;">';
        EmailData +='<tbody>';
        EmailData +='<tr>';
        EmailData +='<td>';
        EmailData +='<table cellpadding="0" cellspacing="0" border="0"  width="700">';
        EmailData +='<tbody>';
        EmailData +='<tr>';
        EmailData +='<td>';
        EmailData +='<table cellpadding="0" cellspacing="0" border="0" align="left" width="100%">';
        EmailData +='<tbody>';
        EmailData +='<tr>';
        EmailData +='<td style="font-family:Arial;padding:3px;font-size:11px; text-align:center; color:#666; padding:5px 0; background:#ccc" >';
        EmailData +='© Copyright 2018 GoTuition. All Rights Reserved.    <a href="#" target="_blank" style="color:#333"><strong></strong></a> ';
        EmailData +='</td>';
        EmailData +='</tr>';
        EmailData +='</tbody>';
        EmailData +='</table>';
        EmailData +='</td>';
        EmailData +='</tr>';
        EmailData +='</tbody>';
        EmailData +='</table>';
        EmailData +='</td>';
        EmailData +='</tr>';
        EmailData +='</tbody>';
        EmailData +='</table>';
        EmailData +='</body>';
        EmailData +='</html>';


        sendmail({
            from: from,
            to: to,
            subject: subject,
            html: EmailData,
        }, function (err, reply) {
            // console.log(err && err.stack);
            // console.dir(reply);
        });
    },

    /*front end base url */
    getbaseurl: function () {

        return 'http://192.168.10.130:4200';
        
    },



    /*send desktop notifications*/
    sendNotifications: function (title, content, subscription) {


        var PUBLIC_VAPID = 'BFjMsx29a0Q_5wH014pxblHumO4VuKuJCjoebqmKjz13KEGbvWVGtqAhixYO5MXXGzx3_wCbizvIe7bA4YN_O74';

        var PRIVATE_VAPID = 'K8t0B-kxoosXt-MpH0nt6WauK9ru1yss-l813HYk564';

        webpush.setVapidDetails('mailto:sijo.prayaninfotech@gmail.com', PUBLIC_VAPID, PRIVATE_VAPID);

        var notificationPayload = {

            notification: {

              title: title,

              body: content,

              icon: 'https://go-tution.firebaseapp.com/assets/outer/images/logo.png'

            }
        };

       // console.log(subscription);

        var promises = [];

        promises.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)));
      
        Promise.all(promises).then(function(data){

            //console.log(data);
            console.log("Notification Success");

        })
        .catch(function(err){

            console.log("Notification failed !");
            console.log(err);

        });

    },




    /* video upload to youtube */
    youtubevideoupload: function (videoname, videopath) {

        console.log(videoname);
        console.log(videopath);


        const Youtube = require("youtube-api")
            , fs = require("fs")
            , readJson = require("r-json")
            , Lien = require("lien")
            , Logger = require("bug-killer")
            , opn = require("opn")
            , prettyBytes = require("pretty-bytes")
            ;

        // I downloaded the file from OAuth2 -> Download JSON
        const CREDENTIALS = readJson(`${__dirname}/credentials.json`);

        // Init lien server
        let server = new Lien({
            host: "192.168.10.112"
            , port: 3000
        });


        // Authenticate
        // You can access the Youtube resources via OAuth2 only.
        // https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
        let oauth = Youtube.authenticate({
            type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: CREDENTIALS.web.redirect_uris[0]
        });

        opn(oauth.generateAuthUrl({
            access_type: "offline"
            , scope: ["https://www.googleapis.com/auth/youtube.upload"]
        }));

        // Handle oauth2 callback
        server.addPage("/oauth2callback", lien => {
            Logger.log("Trying to get the token using the following code: " + lien.query.code);
            oauth.getToken(lien.query.code, (err, tokens) => {

                if (err) {
                    lien.lien(err, 400);
                    return Logger.log(err);
                }

                Logger.log("Got the tokens.");

                oauth.setCredentials(tokens);

                lien.end("The video is being uploaded. Check out the logs in the terminal.");
                console.log("The video is being uploaded. Check out the logs in the terminal.");


                var req = Youtube.videos.insert({
                    resource: {
                        // Video title and description
                        snippet: {
                            title: "Testing YoutTube API NodeJS module"
                            , description: "Test video upload via YouTube API"
                        }
                        // I don't want to spam my subscribers
                        , status: {
                            privacyStatus: "private"
                        }
                    }
                    // This is for the callback function
                    , part: "snippet,status"

                    // Create the readable stream to upload the video
                    , media: {
                        body: fs.createReadStream(videopath + videoname)
                    }
                }, (err, data) => {
                    console.log(data);
                    // process.exit();
                });



                setInterval(function () {
                    Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
                }, 250);
            });
        });

    },




    /*create directory and upload & move file*/
    movefile: function (tmpDir, newDir, fileName){

        return new Promise(function(resolve){

            mv(tmpDir, newDir+fileName, {mkdirp:true}, function(err){

                if(err) { 

                    resolve(0); 

                } else {

                    resolve(1);

                }

            });
        });
    },







}


module.exports = shareexports;