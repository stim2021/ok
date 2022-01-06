const http = require("http"),
  express = require("express"),
  app = express(),
  socketIo = require("socket.io");

const server = http.Server(app).listen(8080);
const io = socketIo(server);
const tf = require("@tensorflow/tfjs-node");

let liveData = [];
let predictionDone = false;

let model;
const gestureClasses = ["hadoken", "punch", "uppercut"];

app.use("/", express.static(__dirname + "/../client/desktop"));
app.use("/predict", express.static(__dirname + "/../client/mobile"));

io.on("connection", async function(socket) {
  model = await tf.loadLayersModel("file://server/model/model.json");
  socket.on("motion data", function(data) {
    predictionDone = false;
    if (liveData.length < 300) {
      liveData.push(
        data.xAcc,
        data.yAcc,
        data.zAcc,
        data.xGyro,
        data.yGyro,
        data.zGyro
      );
    }
  });

  socket.on("end motion data", function() {
    if (!predictionDone && liveData.length) {
      predictionDone = true;
      predict(model, liveData);
      liveData = [];
    }
  });

  socket.on("connected", function(data) {
    console.log("front end connected");
  });
});

const predict = (model, newSampleData) => {
  tf.tidy(() => {
    const inputData = newSampleData;
    const input = tf.tensor2d([inputData], [1, 300]);
    const predictOut = model.predict(input);
    const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];

    switch (winner) {
      case "punch":
        io.emit("gesture", "punch");
        break;
      case "hadoken":
        io.emit("gesture", "hadoken");
        break;
      case "uppercut":
        io.emit("gesture", "uppercut");
        break;
      default:
        break;
    }
  });
};
