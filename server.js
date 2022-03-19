const express = require("express");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const bodyPerser = require("body-parser");
const jsonParser = bodyPerser.json();

const app = express();
app.use(cors());

const BLOGS = {};
const USERS = {};

app.get("/", (req, res) => {
  res.status(200).send("Server is Listening");
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

const server = app.listen(process.env.PORT || 5000, () =>
  console.log(`server started listening`)
);

const peerServer = ExpressPeerServer(server, {
  path: "/",
});

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {});

peerServer.on("disconnect", (client) => {
  Object.entries(USERS).forEach(([key, value]) => {
    if (key !== client.getId()) return;
    delete BLOGS[value][key];
    delete USERS[key];
    if (Object.keys(BLOGS[value]).length) return;
    delete BLOGS[value];
  });
});
