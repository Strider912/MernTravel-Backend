const PlaceModel = require("../models/place");
const fs = require("fs");
const UserModel = require("../models/user");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const mongoose = require("mongoose");

exports.getPlacebyId = async (req, res, next) => {
  const placeId = req.params.pid;

  const place = await PlaceModel.findById(placeId);

  if (!place) return next(new HttpError("No Place found with this id", 401));

  res
    .status(200)
    .json({ status: "success", place: place.toObject({ getters: true }) });
};

exports.getPlacesByUsersId = async (req, res, next) => {
  const userId = req.params.uid;

  const userExist = await UserModel.findById(userId);

  if (!userExist)
    return next(new HttpError("User does not exist with this Id", 401));

  const userPlaces = await UserModel.findById(userId).populate("places");

  if (!userPlaces || userPlaces.places.length === 0)
    return next(
      new HttpError("Could not find places for the provided userId", 404)
    );

  res.status(200).json({
    status: "success",
    places: userPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

exports.createPlace = async (req, res, next) => {
  const {
    title,
    description,
    creator,
    address,
    image = req.file.path,
  } = req.body;

  const userExist = await UserModel.findById(req.user._id);

  if (!userExist) return next(new HttpError("User does not exist", 404));

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createPlace = new PlaceModel({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.user._id,
  });

  let newPlace;
  try {
    await createPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating new places failed. Please try again",
      500
    );
    return next(error);
  }

  try {
    await UserModel.findByIdAndUpdate(
      creator,
      { $push: { places: createPlace._id } },
      { new: true, lean: true }
    );
  } catch (err) {
    const error = new HttpError("Updating place Id in user schema failed", 500);
    return next(error);
  }

  res.status(201).json({ place: createPlace });
};

exports.updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, Could not udpate place", 500)
    );
  }

  if (req.user._id.toString() !== place.creator.toString())
    throw new Error("You are not authorized to perform this action", 401);

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(error);
  }

  res
    .status(200)
    .json({ status: "success", place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await PlaceModel.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError("Error occured while fetching placeId", 404));
  }

  if (!place)
    return next(new HttpError("Could not find place with this Id", 404));

  if (req.user._id.toString() !== place.creator._id.toString())
    throw new Error("You are not authorized to perform this action", 401);

  const imagePath = place.image;

  try {
    await UserModel.update(
      { _id: place.creator._id },
      { $pull: { places: placeId } },
      { new: true, lean: true }
    );
  } catch (err) {
    console.log({ err });
    const error = new HttpError("Updating place Id in user schema failed", 500);
    return next(error);
  }

  try {
    await place.remove();
  } catch (error) {
    return next(
      new HttpError("Something went wrong while deleting place", 500)
    );
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(201).json({ message: "Deleted Place" });
};
