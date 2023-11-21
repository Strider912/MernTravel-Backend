const UserModel = require("../models/user");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res, next) => {
  const { name, email, password, image = req.file.path } = req.body;

  if (!name || !email || !password || !image) {
    console.log({ name, email, password });
    return next(new HttpError("Please enter all required  fields"));
  }

  const userExist = await UserModel.findOne({ email });

  if (userExist) return next(new HttpError("User alrady exist", 401));

  const newUser = await UserModel.create({ name, email, password, image });

  const token = generateToken(newUser._id);
  newUser.password = undefined;

  res
    .status(201)
    .json({ status: "success", token, data: { user: newUser.toObject() } });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new HttpError("Please enter your email & password", 401));
  }

  const userExist = await UserModel.findOne({ email }).select("+password");

  if (
    !userExist ||
    !(await userExist.comparePassword(password, userExist.password))
  )
    return next(new HttpError("Incorrect email & password", 401));

  const token = generateToken(userExist._id);

  res.status(200).json({ status: "success", token, user: userExist });
};

exports.getUsers = async (req, res, next) => {
  let users;

  try {
    users = await UserModel.find({}, "-password");
  } catch (error) {
    return next(new HttpError("Fetching user failed. Please try again", 500));
  }
  res.status(200).json({ status: "success", users });
};
