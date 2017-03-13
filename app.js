var Themeparks = require("themeparks");
var request = require('request');
var AWS = require('aws-sdk');
const uuidV1 = require('uuid/v1');
const elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
    host: 'https://search-disney-world-wait-times-66leo2vlny7rq4zjxnbclx2pnu.us-west-2.es.amazonaws.com/',
    log: 'info'
});

// access a specific park
var disneyMagicKingdom = new Themeparks.Parks.WaltDisneyWorldMagicKingdom();
// checks every hour
var interval = 10000 * 60;

// access wait times by Promise
function WaltDisneyWorldMagicKingdom() {
    disneyMagicKingdom.GetWaitTimes().then(function(rides) {
    // add wait times for all rides to Elasticsearch
    var upload = [];
    for(var i=0, ride; ride=rides[i++];) {
        upload.push({
            'name':ride.name,
            'timestamp':Date.now(),
            'waittime':ride.waitTime
        });
        //console.log(upload);
        elasticUpload(upload);
    }
    }, console.error);
}

//run every set interval
setInterval(WaltDisneyWorldMagicKingdom, interval);


//upload to elasticsearch
var elasticUpload = function (item) {
    for (var i = 0; i < item.length; i++) {
        client.create({
            index: 'disney-world',
            type: 'WaitTime',
            id: uuidV1(),
            body: item[i]
        }, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    }
    console.log("Uploaded to Elasticsearch.");
};

//for debugging
function test() {
    disneyMagicKingdom.GetWaitTimes().then(function(rides) {
    // add wait times for all rides to Elasticsearch
    var upload = [];
    for(var i=0, ride; ride=rides[i++];) {
        console.log(ride.name + ': '  + ride.waitTime );
        //console.log(upload);
    }
    }, console.error);
}

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 5000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

//test();
//WaltDisneyWorldMagicKingdom();