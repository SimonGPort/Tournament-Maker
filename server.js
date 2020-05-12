let express = require("express");
let app = express();
let reloadMagic = require("./reload-magic.js");
let multer = require("multer");
let uploads = multer({
  dest: __dirname + "/uploads",
});

reloadMagic(app);

app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets
let users = [];
let chat = [];

const server = require("http").createServer(app);
server.listen(4001);
const io = require("socket.io")(server);

const server2 = require("http").createServer(app);
server2.listen(4002);
const io2 = require("socket.io")(server2);

////websocket endpoints

// io.sockets.on("connection", (socket) => {
//   console.log("Hello world websocket");
// });

io.on("connection", (socket) => {
  socket.on("chatMounted", () => {
    socket.emit("chatResponse", chat);
  });

  socket.on("message", (data) => {
    chat.push(data);
    socket.emit("chatResponse", chat);
  });
});

io2.on("connection", (socket) => {
  socket.on("yourID+name", (data) => {
    let indexUsers = users.findIndex((user) => user.name === data.name);
    users[indexUsers] = { name: data.name, id: data.id, room: 0 };
    socket.emit("personInTheRoom", users);
  });

  socket.on("roomMounted", () => {
    socket.emit("yourID", socket.id);
  });

  socket.on("callUser", (data) => {
    io2
      .to(data.userToCall)
      .emit("callReceived", { signal: data.signalData, from: data.from });
  });

  socket.on("acceptCall", (data) => {
    console.log("acceptCall data.to:", data.to);

    console.log("acceptCall data:", data.to);
    socket.to(data.to).emit("callAccepted", data.signal);
  });
});

// Your endpoints go after this line
app.post("/login", uploads.none(), async (req, res) => {
  let username = req.body.user;
  if (users.find((user) => user.name === username)) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
  let user = { name: username };
  users.push(user);
  res.send(JSON.stringify({ success: true }));
});

app.post("/logout", uploads.none(), async (req, res) => {
  let user = req.body.user;
  if (!users.includes(user)) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
  ///je travail ici
  users = users.filter((username) => {
    return username !== user;
  });
  res.send(JSON.stringify({ success: true }));
});

// Your endpoints go before this line

app.all("/*", (req, res, next) => {
  // needed for react router
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
