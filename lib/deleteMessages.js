/*
  Module handles message deleting.
*/

'use strict';

const AWS = require('aws-sdk'),
      Joi = require('joi'),
      config = require('../environments/config'),
      dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

/* Joi validation object */
const deleteMessageValidate = Joi.object().keys({
    UserName: Joi
        .string()
        .default('')
        .description('Name of user who posts the message.'),
    TimeStamp: Joi
        .string()
        .default('')
        .description('The timestamp when the message is posted. Will return all msgs posted by the user if this field is missing.')
}).requiredKeys(
    'UserName', 'TimeStamp'
);

// Generate params required for delete
const deleteMessageParams = (query) => {
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

/* Handler for deleteMessage
   Delete the message posted at a specific timestamp
*/
const deleteMessages = (req, resp) => {
    let query = req.query,
        dbParams = deleteMessageParams(query);

    dynamodb.deleteItem(dbParams, (err, data) => {
        if (err) {
            console.log(err);
            resp({Error: err}).code(400);
        } else {
            resp({mete: {status: "Success"}, data: data}).code(200);
        }
    });
};

module.exports = {
    deleteMessageParams,
    config: {
      handler: deleteMessages,
      description: 'Allow user to delete messages.',
      tags: ['api'],
      validate: {
          query: deleteMessageValidate
      }
    }
};
