"use strict";

var lint = require('mocha-eslint');

var options = {
    formatter: 'compact',
    alwaysWarn: false
};

lint(['lib', 'environments', 'routes.js', 'server.js'], options);
