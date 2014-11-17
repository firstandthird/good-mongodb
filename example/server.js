var Good = require('good');
var Hapi = require('hapi');
var GoodMongoDb = require('../');

var server = new Hapi.Server(8081);

var options = {
  //extendedRequests: true,
  reporters: [{
      reporter: Good.GoodConsole
    },
    {
      reporter: GoodMongoDb,
      args: ['mongodb://localhost:27017/good-mongodb', {
        ttl: 30
        /*
        events: {
          ops: '*',
          request: '*',
          log: '*',
          error: '*'
        }
        */
      }]
    }
  ]
};

server.pack.register({
    plugin: require('good'),
    options: options
}, function (err) {

   if (err) {
      console.log(err);
      return;
   }

    server.start(function() {
      server.log(['log', 'server'], 'Hapi server started '+ server.info.uri);
    });

    server.route({
      path: '/',
      method: 'GET',
      handler: function(request, reply) {
        request.log(['log', 'custom'], {
          test: 123
        });
        request.server.log('test', { test: 123 });
        reply({
          test: 123
        });
      }
    });

});
