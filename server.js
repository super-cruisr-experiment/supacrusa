const express = require("express");
const app = express();

var http = require("http").createServer(app);
var io = require("socket.io")(http);

var path = require("path");
var map = {};
var revmap = {};
//var WebSocketServer = require('ws').Server;

//var wss = new WebSocketServer({port: 8000});
/*
wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

wss.on('connection', function(ws) {
    console.log('Connection made')
    ws.on('message', function(message) {
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});*/

function generateUIN() {
  return Math.floor(Math.random() * 10);
}

function myUIN() {
  let uin =
    generateUIN().toString() +
    generateUIN().toString() +
    generateUIN().toString() +
    generateUIN().toString() +
    generateUIN().toString() +
    generateUIN().toString();
  return uin;
}

io.on("connection", socket => {
  console.log("User connected");
  let uin = myUIN();
  map[socket.id] = uin;
  revmap[uin] = socket.id;
  socket.emit("uin", uin);
  socket.on("message", message => {
    console.log(message);
    io.emit("forward", message);
  });
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//app.listen(3000||process.env.PORT)
http.listen(4000, function() {
  console.log("listening on *:4000");
});
