'use strict';

const healthCheck = require('./lib/healthCheck'),
      postMessage = require('./lib/postMessage'),
      getMessage = require('./lib/getMessageByName');

module.exports = [
    {
        method: 'GET',
        path: '/health/check',
        config: {
            handler: healthCheck
        }
    },
    {
        method: 'POST',
        path: '/postMessage',
        config: postMessage
    },
    {
        method: 'GET',
        path: '/getMessageByName',
        config: getMessage
    }
];
