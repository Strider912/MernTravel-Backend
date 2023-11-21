const express = require("express");
const fs = require("fs");
const path = require("path");
var bodyParser = require("body-parser");
const userRoutes = require("./routes/users-routes");
const placeRoutes = require("./routes/places-routes");
const HttpError = require("./models/http-error");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*", "");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/v1/places", placeRoutes);
app.use("/api/v1/users", userRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  // if (res.headerSent) return next(error);
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured!" });
});

module.exports = app;
