/* routing for the service */

'use strict';

const healthCheck = require('./lib/healthCheck'),
      postMessage = require('./lib/postMessage').config,
      getMessages = require('./lib/getMessages').config,
      deleteMessages = require('./lib/deleteMessages').config;

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
        path: '/getMessages',
        config: getMessages
    },
    {
        method: 'DELETE',
        path: '/deleteMessage',
        config: deleteMessages
    }
];
