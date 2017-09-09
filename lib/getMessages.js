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
        .description('The timestamp when the message is posted. Will return all msgs posted by the user if this field is missing.'),
    Limit: Joi
        .number()
        .integer()
        .min(1)
        .default(5)
        .description('Limit the number of records returned.')
});

// Generate params when timestamp missing
const queryMessageParams = function(query){
    let expAttrNames = {},
        expAttrValues = {},
        filterExp = [];

    // If UserName exists, update the query params
    if(query.UserName && query.UserName !== ''){
        expAttrNames['#UN'] = 'UserName';
        expAttrValues[':un'] = {
            S: query.UserName
        };
        filterExp.push('#UN = :un');
    }

    // If TimeStamp exists, update the query params
    if(query.TimeStamp && query.TimeStamp !== ''){
        expAttrNames['#TS'] = 'TimeStamp';
        expAttrValues[':ts'] = {
            S: query.TimeStamp
        };
        filterExp.push('#TS = :ts');
    }

    // Put together, return the parameters for the query
    let params = {
        Limit: query.Limit,
        TableName: config.dynamodb
    };

    if(filterExp.length > 0) {
        params['KeyConditionExpression'] = filterExp.join(' AND ');
        params['ExpressionAttributeNames'] = expAttrNames;
        params['ExpressionAttributeValues'] = expAttrValues;
        return {func: dynamodb.query, params: params};
    } else {
        return {func: dynamodb.scan, params: params};
    }
};

// Serialize a single item in the response
const itemSerialize = function(item){
    return {
        MessageBody: item.MessageBody.S,
        TimeStamp: item.TimeStamp.S,
        UserName: item.UserName.S,
        Extra: item.Extra ? item.Extra.S : '',
        isPalindrome: utils.isPalindrome(item.MessageBody.S)
    };
};

// serialize the whole response from DDB
const querySerialize = function(data){
    let formatted = {
        meta: {
            moreData: data && (data.LastEvaluatedKey !== undefined),
            count: data.Count || 0
        },
        results: []
    };

    if(!data || !data.Items){
        return formatted;
    }

    formatted.results = data.Items.map(itemSerialize);
    return formatted;
}

/* Handler for postMessage
   If timestamp is given, return the message posted by a specific user at a specific time
   Otherwise, return all messages posted by the user
*/
const getMessageByName = function(req, resp){
    let query = req.query,
        dbParams = queryMessageParams(query);

    dbParams.func.call(dynamodb, dbParams.params, function(err, data) {
        if (err) {
            console.log(err);
            resp({Error: err}).code(400);
        } else {
            resp(querySerialize(data)).code(200);
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
