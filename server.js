const dotenv = require("dotenv");
dotenv.config({});
const mongoose = require("mongoose");
const app = require("./app");
const port = process.env.PORT || 4200;

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database failed", err);
  });

app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
