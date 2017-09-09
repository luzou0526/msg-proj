/* routing for the service */

'use strict';

const healthCheck = require('./lib/healthCheck'),
      postMessage = require('./lib/postMessage'),
      getMessages = require('./lib/getMessages'),
      deleteMessages = require('./lib/deleteMessages');

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
        path: '/deleteMessages',
        config: deleteMessages
    }
];
