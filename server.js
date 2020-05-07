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

////websocket endpoints

// io.sockets.on("connection", (socket) => {
//   console.log("Hello world websocket");
// });

io.on("connection", (socket) => {
  console.log("websocket connection");

  socket.on("chatMounted", () => {
    socket.emit("chatResponse", chat);
  });

  socket.on("message", (data) => {
    chat.push(data);
    socket.emit("chatResponse", chat);
  });

  // client.on("username", (username) => {
  //   const user = {
  //     name: username,
  //     id: client.id,
  //   };
  //   users[client.id] = user;
  //   io.emit("connected", user);
  //   io.emit("users", Object.values(users));
  // });
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
