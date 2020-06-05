let express = require("express");
let app = express();
let reloadMagic = require("./reload-magic.js");
let multer = require("multer");
let uploads = multer({
  dest: __dirname + "/uploads",
});
const { PORT = 4000, LOCAL_ADDRESS = "0.0.0.0" } = process.env;
reloadMagic(app);

app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets
let users = [];
let chat = [];

// const server = require("http").createServer(app);
// server.listen(4001);
// const io = require("socket.io")(server);

const server2 = require("http").createServer(app);
// server2.listen(4002);
const io2 = require("socket.io")(server2);

////websocket endpoints

// io.sockets.on("connection", (socket) => {
//   console.log("Hello world websocket");
// });

io2.on("connection", (socket) => {
  console.log("web socket connection");

  socket.on("yourID+name", (data) => {
    // let indexUsers = users.findIndex((user) => user.name === data.name);
    let newUser = {
      name: data.name,
      id: data.id,
      room: 0,
      socketID: socket.id,
    };
    users.push(newUser);
    socket.emit("personInTheRoom", users);
  });

  socket.on("chatMounted", () => {
    console.log("chatMounted");
    socket.emit("chatResponse", { chat: chat, status: "connection" });
  });

  socket.on("message", (data) => {
    chat.push(data);
    io.emit("chatResponse", { chat: chat, status: "messageReceived" });
  });

  socket.on("disconnect", () => {
    console.log("users", users);
    users = users.filter((users) => {
      return users.id !== socket.id;
    });
    console.log("users", users);
    console.log("disconnect:", socket.id);

    users.forEach((user) => {
      socket.to(user.id).emit("disconnected", socket.id);
    });
  });

  // socket.on(" Person-Disconnect", (data) => {
  //   console.log("disconnect2:", socket.id, data);
  //   // io.emit("disconnected", socket.id);
  // });

  socket.on("roomMounted", () => {
    socket.emit("yourID", socket.id);
  });

  socket.on("callUser", (data) => {
    console.log("callUser", data.changeSignal, data.userToCall);
    socket.to(data.userToCall).emit("callReceived", {
      signal: data.signalData,
      from: data.from,
      changeSignal: data.changeSignal,
      id: data.id,
    });
  });

  socket.on("acceptCall", (data) => {
    console.log("acceptCall data.to:", data.to);

    console.log("acceptCall data:", data.to);
    socket.to(data.to).emit("callAccepted", {
      signal: data.signal,
      from: data.from,
      changeSignal: data.changeSignal,
      id: data.id,
    });
  });

  socket.on("askContactToDestroyPeer-toServer", (data) => {
    console.log("askContactToDestroyPeer-toServer");
    socket.to(data.to).emit("askContactToDestroyPeer-toReceiver", {
      to: data.to,
      from: data.from,
    });
  });

  socket.on("askContactToDestroyPeer-Return-toServer", (data) => {
    console.log("askContactToDestroyPeer-Return-toServer");
    socket.to(data.to).emit("askContactToDestroyPeer-Return-toCaller", {
      to: data.to,
      from: data.from,
    });
  });
});

// Your endpoints go after this line
app.post("/login", uploads.none(), async (req, res) => {
  let username = req.body.user;

  //pour pas avoir le meme user connecte
  // if (users.find((user) => user.name === username)) {
  //   res.send(JSON.stringify({ success: false }));
  //   return;
  // }
  // let user = { name: username };
  // users.push(user);
  res.send(JSON.stringify({ success: true }));
});

app.post("/logout", uploads.none(), async (req, res) => {
  console.log("logout");
  let user = req.body.user;
  if (!users.includes(user)) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
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

app.listen(PORT, LOCAL_ADDRESS, () => {
  console.log("Server running on port" + PORT);
});
