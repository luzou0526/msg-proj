/*
    Main Server Module, using Hapi with swagger enabled
*/

'use strict';

const config = require('./environments/config'),
      routes = require('./routes'),
      hapi = require('hapi'),
      os = require('os'),
      cluster = require('cluster'),
      inert = require('inert'),
      vision = require('vision'),
      HapiSwagger = require('hapi-swagger');

// Server Init Function
function serverInit(server, callback){
    // Enable Swagger
    let components = [vision, inert, HapiSwagger];
    server.connection({
        port: config.port,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });
    server.route(routes);
    server.register(components, () => {
        server.start( (err) => {
            if(err){
                callback(err)
            } else {
              console.log(`Server running at ${server.info.uri}, Swagger at ${server.info.uri}/documentation`)
            }
        });
    });
}

// Clusterize service, taking advantage of multi-cores
if (!process.env.NOCLUSTER && cluster.isMaster){
    let cpuCount = os.cpus().length;
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
} else {
    let server = new hapi.Server();
    serverInit(server, (err) => {
        if(err) {
            console.error(`Failed to start the server: ${err}`);
        }
    });
}

module.exports = {
    get: function (url) {
        return new Promise(resolve => {
            let options = {
                method: 'GET',
                url: url
            };
            server.inject(options, resolve);
        });
    },
    post: function (url, payload) {
        return new Promise(resolve => {
            let options = {
                method: 'POST',
                url,
                payload
            };
            server.inject(options, resolve);
        });
    }
};
