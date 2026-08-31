const express = require("express");
const router = express.Router();
const { signup, login, adminLogin, protect, getMe } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/me", protect, getMe);

module.exports = router;