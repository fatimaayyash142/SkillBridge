const Application = require("../models/applicationModel");
const Opportunity = require("../models/opportunityModel");

exports.createApplication = async (req, res) => {
  try {
    const { opportunityId, coverLetter } = req.body;
    const candidateId = req.user._id;


    if (!opportunityId) {
      return res.status(400).json({
        message: "Please provide an opportunity ID"
      });
    }

    
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

 
    if (opportunity.status !== "Published") {
      return res.status(400).json({
        message: "You can only apply to published opportunities"
      });
    }

    const currentDate = new Date();
    const deadlineDate = new Date(opportunity.deadline);
    if (deadlineDate < currentDate) {
      return res.status(400).json({
        message: "The deadline for this opportunity has passed"
      });
    }

    const existingApplication = await Application.findOne({
      candidateId: candidateId,
      opportunityId: opportunityId
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this opportunity"
      });
    }


    const newApplication = await Application.create({
      candidateId: candidateId,
      opportunityId: opportunityId,
      coverLetter: coverLetter
    });

    console.log("Application created:", newApplication._id, "by candidate:", candidateId);

    res.status(201).json({
      status: "success",
      message: "Application submitted successfully",
      data: {
        application: newApplication
      }
    });
  } catch (err) {
    console.log("Error creating application:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user._id;

    const applications = await Application.find({ candidateId: candidateId })
      .populate("opportunityId");

    res.status(200).json({
      status: "success",
      results: applications.length,
      data: {
        applications: applications
      }
    });
  } catch (err) {
    console.log("Error getting my applications:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId)
      .populate("candidateId", "name email phone educationLevel major university skills experience")
      .populate("opportunityId");

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }


    const isCandidateOwner = application.candidateId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";
    const isOrganizationOwner = req.user.role === "Organization" && 
                                application.opportunityId.organizationId.toString() === req.user._id.toString();

    if (!isCandidateOwner && !isAdmin && !isOrganizationOwner) {
      return res.status(403).json({
        message: "You are not authorized to view this application"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        application: application
      }
    });
  } catch (err) {
    console.log("Error getting application:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const candidateId = req.user._id;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }


    if (application.candidateId.toString() !== candidateId.toString()) {
      return res.status(403).json({
        message: "You can only withdraw your own application"
      });
    }

  
    if (application.status === "Accepted" || application.status === "Rejected") {
      return res.status(400).json({
        message: "This application can no longer be withdrawn"
      });
    }


    application.status = "Withdrawn";
    await application.save();

    console.log("Application withdrawn:", applicationId);

    res.status(200).json({
      status: "success",
      message: "Application withdrawn successfully",
      data: {
        application: application
      }
    });
  } catch (err) {
    console.log("Error withdrawing application:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.getOpportunityApplications = async (req, res) => {
  try {
    const opportunityId = req.params.opportunityId;
    const organizationId = req.user._id;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

   
    if (opportunity.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({
        message: "You can only view applications for your own opportunities"
      });
    }

  
    const applications = await Application.find({ opportunityId: opportunityId })
      .populate("candidateId", "name email phone educationLevel major university skills experience");

    res.status(200).json({
      status: "success",
      results: applications.length,
      data: {
        applications: applications
      }
    });
  } catch (err) {
    console.log("Error getting opportunity applications:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

   
    const allowedStatuses = ["Pending", "Under Review", "Shortlisted", "Accepted", "Rejected", "Withdrawn"];

  
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`
      });
    }

   
    const application = await Application.findById(applicationId)
      .populate("opportunityId");

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }


    if (req.user.role === "Organization") {
      if (application.opportunityId.organizationId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to update this application"
        });
      }
    }

   
    application.status = status;
    await application.save();

    console.log("Application status updated:", applicationId, "new status:", status);

    res.status(200).json({
      status: "success",
      message: "Application status updated successfully",
      data: {
        application: application
      }
    });
  } catch (err) {
    console.log("Error updating application status:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};