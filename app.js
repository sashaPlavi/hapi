"use strict";

const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/hapidb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongo conected");
  })
  .catch((err) => {
    console.log(err);
  });

const Task = mongoose.model("Task", { text: String });

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  await server.register(require("@hapi/inert"));
  await server.register(require("@hapi/vision"));
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      // return "zdravooo!";
      return h.view("index", {
        name: "Sasha",
      });
    },
  });
  server.route({
    method: "GET",
    path: "/tasks",
    handler: (request, h) => {
      Task.find((err, tasks) => {
        // console.log(tasks);
        if (err) {
          console.log(err);
        }
        console.log(tasks);

        return h.view("tasks", {
          tasks: tasks,
        });
      });

      // return h.view("tasks", {
      //   tasks: [{ text: "task1" }, { text: "task2" }, { text: "task3" }],
      // });
    },
  });
  server.route({
    method: "GET",
    path: "/img",
    handler: (request, h) => {
      return h.file("./public/legend.jpeg");
    },
  });
  server.views({
    engines: {
      html: require("handlebars"),
    },
    relativeTo: __dirname,
    path: "templates",
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
