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
    handler: async (request, h) => {
      try {
        let result = await Task.find((err, tasks) => {
          if (err) {
            return console.log(err);
          } else {
            return tasks;
          }
        }).lean();
        // console.log(result);
        return h.view("tasks", {
          tasks: result,
        });
      } catch (err) {
        return h.response(err).code(500);
      }
      // try {
      //   return h.view("tasks", {
      //     tasks: [
      //       { id: 1, text: "task1" },
      //       { id: 2, text: "task2" },
      //       { id: 3, text: "task3" },
      //     ],
      //   });
      // } catch (err) {
      //   return console.log(err);
      // }
    },
  });
  server.route({
    method: "POST",
    path: "/tasks",
    handler: async (request, h) => {
      try {
        let task = new Task(request.payload);
        let result = await task.save((err, task) => {
          if (err) {
            return console.log(err);
          } else {
            return task;
          }
        });

        return h.redirect().location("tasks", { tasks: result });
      } catch (err) {
        console.log(err);
        return h.response(err).code(500);
      }
    },
  });

  server.route({
    method: "DELETE",
    path: `/tasks/{id}`,
    handler: async (request, h) => {
      try {
        let deleted = `Hello ${request.params.id}!`;
        return h.redirect().location("", { tasks: deleted });
      } catch (err) {
        return console.log(err);
      }
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
