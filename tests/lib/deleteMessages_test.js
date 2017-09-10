"use strict";
let chai = require('chai'),
    url = require('url'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../environments/config'),
    deleteMessage = require('../../lib/deleteMessages');

describe('#deleteMessageParams', function(){
  it('Should return params for delete request', function(){
    let query = {UserName: "ABC", TimeStamp: "1234"};
    expect(deleteMessage.deleteMessageParams(query)).to.deep.equal({
      TableName: config.dynamodb,
      Key: {
          UserName: {
              S: "ABC"
          },
          TimeStamp: {
              S: "1234"
          }
      }
    });
  });
});
