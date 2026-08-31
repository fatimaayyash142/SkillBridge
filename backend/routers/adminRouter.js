const express = require("express");
const router = express.Router();
const { 
  getAllUsers, 
  getAllOpportunities, 
  getAllApplications, 
  updateUserStatus, 
  deleteUser, 
  deleteOpportunity 
} = require("../controllers/adminController");
const { protect, authorize } = require("../controllers/authController");


router.use(protect);
router.use(authorize("Admin"));

router.get("/users", getAllUsers);
router.get("/opportunities", getAllOpportunities);


router.get("/applications", getAllApplications);
router.patch("/users/:id/status", updateUserStatus);

router.delete("/users/:id", deleteUser);

router.delete("/opportunities/:id", deleteOpportunity);

module.exports = router;