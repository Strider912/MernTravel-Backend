const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) throw new Error("Authentication failed");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) throw new Error("Authentication failed");

    const user = await User.findById(decodedToken.id);

    if (!user) throw new Error("Authentication failed");

    if (user) {
      req.user = user;
      next();
    }
  } catch (error) {
    throw new Error("Authentication failed", 403);
  }
};
