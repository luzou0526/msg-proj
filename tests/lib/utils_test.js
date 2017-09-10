"use strict";
let chai = require('chai'),
    url = require('url'),
    should = require('chai').should(),
    expect = require('chai').expect,
    config = require('../../environments/config'),
    utils = require('../../lib/utils');

describe('#isPalindrome', function(){
    it('empty string shoud be true', function () {
        expect(utils.isPalindrome('')).to.be.true;
    });

    it('one character string shoud be true', function () {
        expect(utils.isPalindrome('?')).to.be.true;
    });

    it('abcdcba should be true', function(){
        expect(utils.isPalindrome('abcdcba')).to.be.true;
    });

    it('abcdcba? should be false', function(){
        expect(utils.isPalindrome('abcdcba?')).to.be.false;
    });
});
