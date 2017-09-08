/*
    Health Check Endpoint Handler
*/

'use strict';

const pkg = require('../package.json');

module.exports = (req, resp) => {
    resp("Service is OK. Version: " + pkg.version);
};
