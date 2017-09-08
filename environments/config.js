/*
    Require configs from each module
*/

"use strict";

const env = process.env.NODE_ENV || 'dev',
      defaultConfig = require('./' + env),
      api_package = require('../package.json');

let config = {
    env: env,
    port: process.env.PORT || defaultConfig.port,
    dynamodb: process.env.DDB || defaultConfig.dynamodb
};

module.exports = config;
