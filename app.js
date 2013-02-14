var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var PORT = process.env.PORT || 8080;
server.listen(PORT)

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

console.log("Running at http://localhost:" + PORT)
