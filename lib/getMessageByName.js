/*
  Module handles message posting.
*/

'use strict';

const AWS = require('aws-sdk'),
      Joi = require('joi'),
      config = require('../environments/config'),
      utils = require('./utils'),
      dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

/* Joi validation object */
const getMessageByNameValidate = Joi.object().keys({
    UserName: Joi
        .string()
        .default('')
        .description('Name of user who posts the message.'),
    TimeStamp: Joi
        .string()
        .default('')
        .description('Optional: The timestamp when the message is posted. Will return all msgs posted by the user if this field is missing.'),
}).requiredKeys(
    'UserName'
);

// Generate params when timestamp missing
const scanMessageParams = function(query){
    // Basic parameters for the scan request
    let expAttrNames = {
        "#UN": "UserName"
    },
    expAttrValues = {
        ":user": {
            S: query.UserName
        }
    },
    filterExp = "#UN = :user";

    // If TimeStamp exist, update the query params
    if(query.TimeStamp || query.TimeStamp !== ''){
        expAttrNames["#TS"] = "TimeStamp";
        expAttrValues[":ts"] = {
            S: query.TimeStamp
        };
        filterExp += " AND #TS = :ts"
    }

    return {
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: expAttrValues,
        FilterExpression: filterExp,
        TableName: config.dynamodb
    };
};

// Serialize a single item in the response
const itemSerialize = function(item){
    return {
        MessageBody: item.MessageBody.S,
        TimeStamp: item.TimeStamp.S,
        UserName: item.UserName.S,
        Extra: item.Extra.S,
        isPalindrome: utils.isPalindrome(item.MessageBody.S)
    };
};

// serialize the whole response from DDB
const scanSerialize = function(data){
    if(!data || !data.Items){
        return [];
    }
    let res = [];
    for(let i = 0; i < data.Items.length; i++){
        res.push(itemSerialize(data.Items[i]));
    }
    return res;
}

/* Handler for postMessage
   If timestamp is given, return the message posted by a specific user at a specific time
   Otherwise, return all messages posted by the user
*/
const getMessageByName = function(req, resp){
    let query = req.query,
        params = scanMessageParams(query);
    dynamodb.scan(params, function(err, data) {
        if (err) {
            console.log(err);
            resp({Error: err}).code(400);
        } else {
            resp(scanSerialize(data)).code(200);
        }
    });
};

module.exports = {
    handler: getMessageByName,
    description: 'Allow user to post a message.',
    tags: ['api'],
    validate: {
        query: getMessageByNameValidate
    }
};
