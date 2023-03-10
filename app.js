const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(express.json());

// Cross-origin resource sharing (CORS) allows AJAX requests to skip the Same-origin policy and access resources from remote hosts.
app.use(cors());

// To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
// This middleware tells express if there is request for the file, go to the folder "public", there will be no file in other folders
app.use(express.static("public"));

// CONTACTS ROUTER
app.use("/api/contacts", contactsRouter);

// USERS ROUTER
app.use("/users", usersRouter);

// ERROR HANDLERS/MIDDLEWARES
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((req, res) => {
  res.status(400).json({ message: "Missing required name field" });
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  res.status(status).json({ message: err.message });
});

module.exports = app;
