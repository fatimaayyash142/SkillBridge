const express = require("express");
const router = express.Router();
const { 
  createApplication, 
  getMyApplications, 
  getApplication, 
  withdrawApplication, 
  getOpportunityApplications, 
  updateApplicationStatus 
} = require("../controllers/applicationController");
const { protect, authorize } = require("../controllers/authController");

router.use(protect);

router.post("/", authorize("Candidate"), createApplication);
router.get("/my", authorize("Candidate"), getMyApplications);


router.patch("/:id/withdraw", authorize("Candidate"), withdrawApplication);

router.get("/opportunity/:opportunityId", authorize("Organization"), getOpportunityApplications);
router.get("/:id", getApplication);

router.patch("/:id/status", authorize("Organization", "Admin"), updateApplicationStatus);

module.exports = router;