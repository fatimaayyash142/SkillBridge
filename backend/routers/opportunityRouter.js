const express = require("express");
const router = express.Router();
const { 
  createOpportunity, 
  getAllOpportunities, 
  searchOpportunities, 
  getOpportunity, 
  updateOpportunity, 
  deleteOpportunity, 
  publishOpportunity, 
  closeOpportunity 
} = require("../controllers/opportunityController");
const { protect, authorize } = require("../controllers/authController");


router.get("/", getAllOpportunities);
router.get("/search", searchOpportunities);


router.get("/:id", getOpportunity);


router.post("/", protect, authorize("Organization"), createOpportunity);


router.put("/:id", protect, authorize("Organization"), updateOpportunity);
router.delete("/:id", protect, authorize("Organization"), deleteOpportunity);
router.patch("/:id/publish", protect, authorize("Organization"), publishOpportunity);


router.patch("/:id/close", protect, authorize("Organization"), closeOpportunity);

module.exports = router;