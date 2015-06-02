var Hapi = require('hapi');
var GoodMongoDb = require('../');
var Boom = require('boom');

var server = new Hapi.Server();

server.connection({ port: 8081 });

var options = {
  //extendedRequests: true,
  requestPayload: true,
  reporters: [
    {
      reporter: require('good-console'),
      events: {
        //ops: '*',
        response: '*',
        log: '*',
        error: '*'
      }
    },
    {
      reporter: GoodMongoDb,
      events: {
        response: '*',
        error: '*',
        log: '*',
      },
      config: {
        connectionUrl: 'mongodb://localhost:27017/good-mongodb',
        ttl: 60*5,
      }
    }
  ]
};

server.register({
    register: require('good'),
    options: options
}, function (err) {

   if (err) {
      console.log(err);
      return;
   }

    server.start(function() {
      server.log(['log', 'server'], 'Hapi server started '+ server.info.uri);
    });

    server.route([
      {
        path: '/',
        method: '*',
        handler: function(request, reply) {
          request.log(['log', 'custom'], {
            test: 123
          });

          request.server.log('test', { test: 123 });
          reply({
            test: 123
          });
        }
      },
      {
        path: '/internal',
        method: 'GET',
        handler: function(request, reply) {
          request.methods.getSomething();
          reply('oops');
        }
      },
      {
        path: '/internal2',
        method: 'GET',
        handler: function(request, reply) {
          var test = {};
          test.email.user = 12;
          reply('oops');
        }
      },
      {
        path: '/error',
        method: '*',
        handler: function(request, reply) {
          reply(Boom.badRequest('invalid'));
        }
      },
      {
        path: '/stop',
        method: 'GET',
        handler: function(request, reply) {
          reply('stopping');
          request.server.stop();
        }
      }
    ]);


});
