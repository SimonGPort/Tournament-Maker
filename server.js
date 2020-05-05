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

// Your endpoints go after this line
app.post("/login", uploads.none(), async (req, res) => {
  let user = req.body.user;
  if (users.includes(user)) {
    res.send(JSON.stringify({ success: false }));
    return;
  }
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
