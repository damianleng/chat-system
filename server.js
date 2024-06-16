const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
  });

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

app.get("/messages", (req, res) => {
  Message.find({})
    .exec()
    .then((messages) => {
      res.send(messages);
      console.log("Message sent");
    })
    .catch((err) => {
      res.status(500).send(err);
      console.error("error message");
    });
});

app.post("/messages", (req, res) => {
  var message = new Message(req.body);
  message
    .save()
    .then(() => {
      io.emit("message", req.body);
      res.sendStatus(200);
    })
    .catch((err) => res.status(500).send(err));
});

io.on("connection", () => {
  console.log("a user is connected");
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("server is running on port", port);
});
