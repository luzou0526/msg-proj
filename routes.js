'use strict';

const healthCheck = require('./lib/healthCheck'),
      postMessage = require('./lib/postMessage').hapiConfig;

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
    }
];
