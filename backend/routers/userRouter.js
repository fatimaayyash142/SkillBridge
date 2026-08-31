const express = require("express");
const router = express.Router();
const { getMyProfile, updateMyProfile } = require("../controllers/userController");
const { protect } = require("../controllers/authController");

router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateMyProfile);

module.exports = router;