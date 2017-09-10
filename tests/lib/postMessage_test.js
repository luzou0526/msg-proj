"use strict";
let chai = require('chai'),
    url = require('url'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../environments/config'),
    postMessage = require('../../lib/postMessage');

describe('#postMessageParams', function(){
    it('Should return params from request', function () {
        let query = {
          UserName: "Hello",
          MessageBody: "World",
          Extra: "some extra"
        }
        let exp_item = {
            'UserName': {
                S: "Hello"
            },
            'MessageBody': {
                S: "World"
            },
            'Extra':{
                S: "some extra"
            }
        }
        let res = postMessage.postMessageParams(query);
        expect(res.TableName).equal(config.dynamodb);
        expect(res.Item.UserName.S).equal(exp_item.UserName.S);
        expect(res.Item.MessageBody.S).equal(exp_item.MessageBody.S);
        expect(res.Item.Extra.S).equal(exp_item.Extra.S);
        expect(res.Item.TimeStamp).not.equal(null);
    });
});
