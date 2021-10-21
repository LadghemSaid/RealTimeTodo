const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const autoIncrement = require("mongoose-auto-increment");
const http = require("http");
const socketServer = require("socket.io");

const app = express();

const todoModel = require("./models/todoModel"); //todo model

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MONGOOSE CONNECT
// ===========================================================================
mongoose.connect("mongodb://mongodb:27017/realtime_todo", {
  useMongoClient: true,
});

var db = mongoose.connection;
db.on("error", () => {
  console.log("---FAILED to connect to mongoose");
});
db.once("open", () => {
  console.log("+++ connected to mongoose");
});

var serve = http.createServer(app);
var io = socketServer(serve);
serve.listen(3000, () => {
  console.log("+++Express Server with Socket Running!!!");
});

/***************************************************************************************** */
/* Socket logic starts here																   */
/***************************************************************************************** */
const connections = [];
io.on("connection", function (socket) {
  console.log("Connected to Socket!!" + socket.id);
  connections.push(socket);
  socket.on("disconnect", function () {
    console.log("Disconnected - " + socket.id);
  });

  var cursor = todoModel.find({}, (err, result) => {
    if (err) {
      console.log("---GET failed!!");
    } else {
      socket.emit("initialList", result);
      console.log("+++GET worked!! nbr : ", result.length);
    }
  });
  socket.on("addItem", (addData) => {
    var todoItem = new todoModel({
      itemId: addData.id,
      title: addData.title,
      description: addData.description,
      completed: addData.completed,
    });

    todoItem.save((err, result) => {
      if (err) {
        console.log("--- ADD NEW ITEM failed!! " + err);
      } else {
        io.emit("itemAdded", addData);

        console.log({ message: "+++ ADD NEW ITEM worked!!" });
      }
    });
  });

  socket.on("deleteAll", () => {
    todoModel.deleteMany({}, (err, result) => {
      if (err) {
        console.log("--- DELETE ALL ITEM failed!! " + err);
      } else {
        io.emit("allItemDeleted");

        console.log({ message: "+++ DELETE ALL ITEM worked!!" });
      }
    });
  });
  socket.on("markAll", (completedFlag) => {
    var updateValue = { completed: completedFlag.completed };

    todoModel.updateMany({}, updateValue, (err, result) => {
      if (err) {
        console.log("--- MARKED ALL  COMPLETE failed!! " + err);
      } else {
        io.emit("allItemMarked", completedFlag);

        console.log({ message: "+++ MARKED ALL ITEM worked!!" });
      }
    });
  });

  socket.on("markItem", (markedItem) => {
    var condition = { itemId: markedItem.id },
      updateValue = { completed: markedItem.completed };

    todoModel.update(condition, updateValue, (err, result) => {
      if (err) {
        console.log("--- MARK COMPLETE failed!! " + err);
      } else {
        io.emit("itemMarked", markedItem);

        console.log({ message: "+++MARK COMPLETE worked!!" });
      }
    });
  });
});
