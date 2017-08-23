const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({port: 3000});

server.register(require('inert'), err => {
  if(err) throw err;
});

server.route({
  path: '/',
  method: 'GET',
  handler: (request, reply) => {
    reply.file('public/index.html');
  }
})

server.start( () => {
  console.log("Listening on " + server.info.uri);
});
