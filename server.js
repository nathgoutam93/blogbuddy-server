const express = require("express");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");

const bodyPerser = require("body-parser");
const jsonParser = bodyPerser.json();

const app = express();
app.use(cors());

const BLOGS = {};
const USERS = {};

app.get("/", (req, res) => {
  res.status(200).send("ok");
});

app.get("/getUsers", (req, res) => {
  res.json({
    users: BLOGS,
  });
});

app.post("/saveUser", jsonParser, (req, res) => {
  const data = req.body;

  USERS[data.userId] = data.blogId;
  BLOGS[data.blogId] = { ...BLOGS[data.blogId], [data.userId]: data.userId };

  res.json({
    users: BLOGS[data.blogId],
  });
});

const server = app.listen(5000);

const peerServer = ExpressPeerServer(server, {
  path: "/",
});

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log(client.getId(), " connected");
});

peerServer.on("disconnect", (client) => {
  console.log(client.getId(), " disconnected");
  Object.entries(USERS).forEach(([key, value]) => {
    if (key === client.getId()) {
      delete BLOGS[value][key];
      delete USERS[key];
    }
  });
});
