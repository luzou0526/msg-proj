/*
  Module handles message posting.
*/

'use strict';

const AWS = require('aws-sdk'),
      Joi = require('joi'),
      config = require('../environments/config'),
      dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

/* Joi validation object */
const postMessageValidate = Joi.object().keys({
    UserName: Joi
        .string()
        .default('Anonymous')
        .description('Name of user who posts the message.'),
    MessageBody: Joi
        .string()
        .not('')
        .description('The message content.'),
    Extra: Joi
        .string()
        .default('')
        .description('Any additional info about the message.')
}).requiredKeys(
    'UserName', 'MessageBody'
);

/* Handler for postMessage */
const postMessage = function(req, resp){
    let query = req.query;
    let curTime = (new Date()).getTime();
    let params = {
        TableName: config.dynamodb,
        Item: {
            'UserName': {
                S: query.UserName
            },
            'TimeStamp': {
                S: curTime.toString()
            },
            'MessageBody': {
                S: query.MessageBody
            },
            'Extra': {
                S: query.Extra
            }
        }
    };

    dynamodb.putItem(params, function(err, result){
        if(err){
            console.log('ERR: ' + err);
            resp({Error: err}).code(400);
        } else {
            resp("Success").code(200);
        }
    });
};

module.exports = {
    hapiConfig: {
        handler: postMessage,
        description: 'Allow user to post a message.',
        tags: ['api'],
        validate: {
            query: postMessageValidate
        }
    }
};
