"use strict";
let chai = require('chai'),
    url = require('url'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../environments/config'),
    getMessage = require('../../lib/getMessages'),
    AWS = require('aws-sdk'),
    dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

describe('#querySerialize', function(){
  it('should return formatted response for all items', function(){
    let data = {
      Count: 2,
      Items: [
        {
          UserName: {
            S: "Hello"
          },
          TimeStamp: {
            S: "1234"
          },
          MessageBody: {
            S: "World"
          }
        },
        {
          UserName: {
            S: "Good"
          },
          TimeStamp: {
            S: "1235"
          },
          MessageBody: {
            S: "Morning"
          },
          Extra: {
            S: "Happy"
          }
        }
      ]
    };
    let res = getMessage.querySerialize(data);
    expect(res.meta.count).equal(2);
    expect(res.meta.LastEvaluatedKey).equal(null);
    expect(res.meta.moreData).to.be.false;
    expect(res.results.length).equal(2);
  });
});

describe('#itemSerialize', function(){
  it('Should return serialized item', function () {
    let data = {
        UserName: {
          S: "Hello"
        },
        TimeStamp: {
          S: "1234"
        },
        MessageBody: {
          S: "World"
        },
        Extra: {
          S: "Ha"
        }
      }
      let res = getMessage.itemSerialize(data);
      expect(res.MessageBody).equal("World");
      expect(res.TimeStamp).equal("1234");
      expect(res.Extra).equal("Ha");
      expect(res.UserName).equal("Hello");
      expect(res.isPalindrome).to.be.false;
  });
});

describe('#queryMessagesParams', function(){
  it("All fields missing, limit is 10", function(){
    let query = {Limit: 10};
    let res = getMessage.queryMessagesParams(query);

    expect(res).to.deep.equal({
      func: dynamodb.scan,
      params: {
        TableName: config.dynamodb,
        Limit: 10
      }
    });
  });

  it("When UserName exists", function(){
    let query = {Limit: 10, UserName: "ABC"};
    let res = getMessage.queryMessagesParams(query);

    expect(res).to.deep.equal({
      func: dynamodb.query,
      params: {
        TableName: config.dynamodb,
        Limit: 10,
        KeyConditionExpression: '#UN = :un',
        ExpressionAttributeNames: {
          '#UN': 'UserName'
        },
        ExpressionAttributeValues: {
          ':un': {
              S: "ABC"
          }
        }
      }
    });
  });

  it("When UserName and TimeStamp exist", function(){
    let query = {Limit: 10, UserName: "ABC", TimeStamp: "1234"};
    let res = getMessage.queryMessagesParams(query);

    expect(res).to.deep.equal({
      func: dynamodb.query,
      params: {
        TableName: config.dynamodb,
        Limit: 10,
        KeyConditionExpression: '#UN = :un AND #TS = :ts',
        ExpressionAttributeNames: {
          '#UN': 'UserName',
          "#TS": 'TimeStamp'
        },
        ExpressionAttributeValues: {
          ':un': {
              S: "ABC"
          },
          ':ts': {
              S: "1234"
          }
        }
      }
    });
  });

  it("When UserName and TimeStamp and Limit exist", function(){
    let query = {Limit: 10, UserName: "ABC", TimeStamp: "1234", StartKey: {UserName: "GG", TimeStamp: "5678"}};
    let res = getMessage.queryMessagesParams(query);

    expect(res).to.deep.equal({
      func: dynamodb.query,
      params: {
        TableName: config.dynamodb,
        Limit: 10,
        KeyConditionExpression: '#UN = :un AND #TS = :ts',
        ExpressionAttributeNames: {
          '#UN': 'UserName',
          "#TS": 'TimeStamp'
        },
        ExpressionAttributeValues: {
          ':un': {
              S: "ABC"
          },
          ':ts': {
              S: "1234"
          }
        },
        ExclusiveStartKey: {
            UserName: {
                S: "GG"
            },
            TimeStamp: {
                S: "5678"
            }
        }
      }
    });
  });
});
