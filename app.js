var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , redis = require('redis')
  , url = require('url');

var PORT = process.env.PORT || 8080
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

var redisMain = newRedisClient();

server.listen(PORT)

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('messages', 'hello world');

  console.log("redis: init")
  var redisConn = newRedisClient();
  redisConn.on("message", function(channel, message) {
    console.log("redis message " + channel + ": " + message)
    socket.emit('messages', message)
  })
  redisConn.on("subscribe", function(channel, count) {
    console.log("redis: publishing on main")
    redisMain.publish("drain", "sent via redis")
  })
  console.log("redis: subscribing..")
  redisConn.subscribe("drain")
});

console.log("Running at http://localhost:" + PORT)
