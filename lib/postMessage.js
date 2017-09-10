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

/* params for postMessage */
const postMessageParams = (query) => {
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
        item['Extra'] = {
            S: query.Extra
        };
    }

    return {
        TableName: config.dynamodb,
        Item: item
    };
};

/* Handler for postMessage */
const postMessage = (req, resp) => {
    let query = req.query,
        params = postMessageParams(query);
    dynamodb.putItem(params, (err, data) => {
        if(err){
            console.log('ERR: ' + err);
            resp({Error: err}).code(400);
        } else {
            resp({mete: {status: "Success"}, data: data}).code(200);
        }
    });
};

module.exports = {
    postMessageParams,
    config: {
      handler: postMessage,
      description: 'Allow user to post a message.',
      tags: ['api'],
      validate: {
          query: postMessageValidate
      }
    }
};
