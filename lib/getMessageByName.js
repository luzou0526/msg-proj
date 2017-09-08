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
        .description('The timestamp when the message is posted. (UserName and TimeStamp form a key)'),
}).requiredKeys(
    'UserName'
);

const queryMessageParams = function(query){
    return {
        TableName: config.dynamodb,
        Key: {
            UserName: {
                S: query.UserName
            },
            TimeStamp: {
                S: query.TimeStamp
            }
        }
    };
};

const scanMessageParams = function(query){

};

const itemSerialize = function(item){
    return {
        MessageBody: item.MessageBody.S,
        TimeStamp: item.TimeStamp.S,
        UserName: item.UserName.S,
        Extra: item.Extra.S,
        isPalindrome: utils.isPalindrome(item.MessageBody.S)
    };
};

// Simple Serialize for a single item response
const querySerialize = function(data){
    if(!data || !data.Item){
        return [];
    }
    return [itemSerialize(data.Item)];
};

/* Handler for postMessage
   If timestamp is given, return the message posted by a specific user at a specific time
   Otherwise, return all messages posted by the user
*/
const getMessageByName = function(req, resp){
    let query = req.query,
        params;
    if(query.TimeStamp !== ''){
        params = queryMessageParams(query);
        dynamodb.getItem(params, function(err, data) {
            if (err) {
                console.log('ERR: ' + err);
                resp({Error: err}).code(400);
            }
            else {
                resp(querySerialize(data)).code(200);
            }
        });
    } else {
        params = scanMessageParams(query);
    }
};

module.exports = {
    handler: getMessageByName,
    description: 'Allow user to post a message.',
    tags: ['api'],
    validate: {
        query: getMessageByNameValidate
    }
};
