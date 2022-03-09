const express = require("express");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");

const bodyPerser = require("body-parser");
const jsonParser = bodyPerser.json();

const app = express();
app.use(cors());

const USERS = [];

app.get("/", (req, res) => {
  res.status(200).send("ok");
});

app.get("/getUsers", (req, res) => {
  res.json({
    users: USERS,
  });
});

app.post("/saveUser", jsonParser, (req, res) => {
  const data = req.body;

  USERS.push(data.userId);

  res.json({
    users: USERS,
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
  USERS.forEach((user, index) => {
    if (user === client.getId()) {
      USERS.splice(index, 1);
    }
  });
});
