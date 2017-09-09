"use strict";
let chai = require('chai'),
    url = require('url'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../environments/config'),
    utils = require('../../lib/utils');

describe('#isPalindrome', function(){
    it('empty string shoud be true', function () {
        utils.isPalindrome('').should.be.equal(true);
    });

    it('one character string shoud be true', function () {
        utils.isPalindrome('?').should.be.equal(true);
    });

    it('abcdcba should be true', function(){
        utils.isPalindrome('abcdcba').should.be.equal(true);
    })

    it('abcdcba? should be false', function(){
        utils.isPalindrome('abcdcba?').should.be.equal(false);
    })
});
