const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let usercount;

/**
 * "/"にアクセスがあったらindex.htmlを返却
 */
app.get("/", (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  console.log(ip)
  res.sendFile(__dirname + "/index.html");
});
app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + '/script.js')
});


const date1 = new Date();
const datetime = date1.toLocaleString();

console.log(datetime);

/**
 * [イベント] ユーザーが接続
 */
io.on("connection", (socket) => {
  console.log("ユーザーが接続しました");

  socket.on('join', (room) => {
    console.log("ROOMJOIN")
    socket.join(room)
    io.to(room).emit("join");  
  })

  socket.on('ytid_select' , (ytid) => {
  io.to(ytid.room).emit("ytid_select" , ytid.value);  
  })
  socket.on('msg' , (ytid) => {
  io.to(ytid.room).emit("msg" , ytid.value);  
  })

  socket.on("pauce", (msg) => {
    io.to(msg.room).emit("pauce", msg);
  });
  socket.on("play", (msg) => {
    io.to(msg.room).emit("play" , msg);
  });

  socket.on("disconnect", () => {

    console.log("dis");

    io.emit("member-post", "ユーザーの切断がありました")
  });
});

/**
 * 3000番でサーバを起動する
 */
http.listen(3000, () => {
  console.log("listening on *:3000");
});