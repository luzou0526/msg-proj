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
        .not('')
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
    let item = {
        'UserName': {
            S: query.UserName
        },
        'TimeStamp': {
            S: curTime.toString()
        },
        'MessageBody': {
            S: query.MessageBody
        }
    };
    if(query.Extra && query.Extra !== ''){
        item['Extra'] = query.Extra;
    }

    let params = {
        TableName: config.dynamodb,
        Item: item
    };

    dynamodb.putItem(params, function(err, data){
        if(err){
            console.log('ERR: ' + err);
            resp({Error: err}).code(400);
        } else {
            resp({mete: {status: "Success"}, data: data}).code(200);
        }
    });
};

module.exports = {
    handler: postMessage,
    description: 'Allow user to post a message.',
    tags: ['api'],
    validate: {
        query: postMessageValidate
    }
};
