/*
  Module handles message retrieving.
*/

'use strict';

const AWS = require('aws-sdk'),
      Joi = require('joi'),
      config = require('../environments/config'),
      utils = require('./utils'),
      dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

/* Joi validation object */
const UserNameValidate = Joi.string().default('').description('Name of user who posts the message.');
const TimeStampValidate = Joi.string().default('').description('The timestamp when the message is posted. Will return all msgs posted by the user if this field is missing.');
const getMessagesValidate = Joi.object().keys({
    UserName: UserNameValidate,
    TimeStamp: TimeStampValidate,
    Limit: Joi
        .number()
        .integer()
        .min(1)
        .default(5)
        .description('Limit the number of records returned.'),
    StartKey: Joi
        .object()
        .keys({
            'UserName': UserNameValidate,
            'TimeStamp': TimeStampValidate
        }).requiredKeys(
            'UserName', 'TimeStamp'
        ).optional()
});

// Generate params depends on parameters in the request
const queryMessagesParams = function(query){
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

    if(query.StartKey) {
        params['ExclusiveStartKey'] = {
            UserName: {
                S: query.StartKey.UserName
            },
            TimeStamp: {
                S: query.StartKey.TimeStamp
            }
        };
    }

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
            count: data.Count || 0,
            LastEvaluatedKey: data.LastEvaluatedKey || null
        },
        results: []
    };

    if(!data || !data.Items){
        return formatted;
    }

    formatted.results = data.Items.map(itemSerialize);
    return formatted;
}

/* Handler for getMessages
   If all params missing, return all items within limit
   If user name exists, return all items posted by the user
   If time stamp exists, return the item posted at a specific time
*/
const getMessages = function(req, resp){
    let query = req.query,
        dbParams = queryMessagesParams(query);

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
    handler: getMessages,
    description: 'Allow user to retrieve messages.',
    tags: ['api'],
    validate: {
        query: getMessagesValidate
    }
};
