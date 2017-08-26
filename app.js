const Hapi = require('hapi');

const server = new Hapi.Server();

const io = require('socket.io')();

server.connection({port: 3000});

server.register([require('inert'), require('vision')], err => {
  if(err) throw err;

  server.start( () => {
    console.log("Listening on " + server.info.uri);
  });
});

server.views({
  engines:{
    html: require('handlebars')
  },
  path: './views'
});

server.route({
  path: '/',
  method: 'GET',
  handler: (request, reply) => {
    reply.view('index', {
      uri: server.info.uri
    });
  }
})



io.attach(server.listener);

io.on('connection', (socket) => {
  console.log("New user.");

  socket.on("buttonClicked", (id) => {
    console.log("yaaaH" + id);
    io.emit("addX", id);
  });

});
