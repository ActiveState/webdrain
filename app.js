var app = require('express')()
  , net = require('net')
  , readline = require('readline')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , redis = require('redis')
  , url = require('url');

var PORT = process.env.PORT || 8080
var TCP_PORT = process.env.STACKATO_HARBOR || 8081
var REDIS_URL = url.parse(
  process.env.REDIS_URL || "redis://localhost:6379")

function newRedisClient() {
  var redisCli = redis.createClient(REDIS_URL.port, REDIS_URL.hostname)
  console.log(REDIS_URL)
  if (REDIS_URL.auth != undefined) {
    var pass = REDIS_URL.auth.split(":")[1];
    redisCli.auth(pass)
  }
  return redisCli;
}

function externalPort() {
  if (process.env.STACKATO_SERVICES) {
    return JSON.parse(process.env.STACKATO_SERVICES)["webdrain-tcp"]["port"]
  } else {
    return TCP_PORT
  }
}

var redisMain = newRedisClient();

server.listen(PORT)

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  console.log("redis: init")
  cmd = "kato log drain add webdrain tcp://<this-domain>:" + externalPort()
  socket.emit('messages', "Run: " + cmd)
  var redisConn = newRedisClient();
  redisConn.on("message", function(channel, message) {
    console.log("redis message " + channel + ": " + message)
    socket.emit('messages', message)
  })
  console.log("redis: subscribing..")
  redisConn.subscribe("drain")
});

console.log("Running at http://localhost:" + PORT)

// TCP drain

var tcpDrain = net.createServer(function (socket) {
  var rl = readline.createInterface(socket, socket);
  rl.prompt();
  rl.on('line', function(line) {
    console.log("Received: " + line)
    redisMain.publish("drain", line)
    rl.prompt();
  })
})

tcpDrain.listen(TCP_PORT, '0.0.0.0')
