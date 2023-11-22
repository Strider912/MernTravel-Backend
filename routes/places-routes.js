const express = require("express");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:pid", placesControllers.getPlacebyId);
router.get("/user/:uid", placesControllers.getPlacesByUsersId);

router.use(checkAuth);

// router.route("/").post(placesControllers.createPlace);
router.post("/", fileUpload.single("image"), placesControllers.createPlace);

router.patch("/:pid", placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
