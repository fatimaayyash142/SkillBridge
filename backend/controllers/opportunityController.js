const Opportunity = require("../models/opportunityModel");


exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, type, requiredSkills, location, workArrangement, deadline } = req.body;

    
    if (
  !title ||
  !description ||
  !type ||
  !location ||
  !workArrangement ||
  !deadline
) {
  return res.status(400).json({
    message:
      "Please provide title, description, type, location, work arrangement, and deadline"
  });
}

    const newOpportunity = await Opportunity.create({
      organizationId: req.user._id,
      title: title,
      description: description,
      type: type,
      requiredSkills: requiredSkills || [],
      location: location,
      workArrangement: workArrangement,
      deadline: deadline
    });

    console.log("New opportunity created:", newOpportunity._id, "by organization:", req.user._id);

    res.status(201).json({
      status: "success",
      message: "Opportunity created successfully",
      data: {
        opportunity: newOpportunity
      }
    });
  } catch (err) {
    console.log("Error creating opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      status: "Published"
    }).populate(
      "organizationId",
      "name email phone website description"
    );

    res.status(200).json({
      status: "success",
      results: opportunities.length,
      data: {
        opportunities: opportunities
      }
    });
  } catch (err) {
    console.log("Error getting all opportunities:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.searchOpportunities = async (req, res) => {
  try {
    const searchKeyword = req.query.search || "";

    const opportunities = await Opportunity.find({
      status: "Published",
      $or: [
        { title: { $regex: searchKeyword, $options: "i" } },
        { description: { $regex: searchKeyword, $options: "i" } },
        { requiredSkills: { $regex: searchKeyword, $options: "i" } }
      ]
    }).populate("organizationId", "name email phone website description");

    console.log("Search performed for keyword:", searchKeyword, "found:", opportunities.length);

    res.status(200).json({
      status: "success",
      results: opportunities.length,
      data: {
        opportunities: opportunities
      }
    });
  } catch (err) {
    console.log("Error searching opportunities:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.getOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      status: "Published"
    }).populate(
      "organizationId",
      "name email phone website description"
    );

    if (!opportunity) {
      return res.status(404).json({
        message: "Published opportunity not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        opportunity: opportunity
      }
    });
  } catch (err) {
    console.log("Error getting opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const currentOrganizationId = req.user._id;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    if (
      opportunity.organizationId.toString() !==
      currentOrganizationId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this opportunity"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "type",
      "requiredSkills",
      "location",
      "workArrangement",
      "deadline"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    await opportunity.save();

    console.log("Opportunity updated:", opportunityId);

    res.status(200).json({
      status: "success",
      message: "Opportunity updated successfully",
      data: {
        opportunity: opportunity
      }
    });
  } catch (err) {
    console.log("Error updating opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const currentOrganizationId = req.user._id;


    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    if (opportunity.organizationId.toString() !== currentOrganizationId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this opportunity"
      });
    }

    
    await opportunity.deleteOne();

    console.log("Opportunity deleted:", opportunityId);

    res.status(200).json({
      status: "success",
      message: "Opportunity deleted successfully"
    });
  } catch (err) {
    console.log("Error deleting opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.publishOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const currentOrganizationId = req.user._id;

    
    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    
    if (opportunity.organizationId.toString() !== currentOrganizationId.toString()) {
      return res.status(403).json({
        message: "You can only publish your own opportunities"
      });
    }

    opportunity.status = "Published";
    await opportunity.save();

    console.log("Opportunity published:", opportunityId);

    res.status(200).json({
      status: "success",
      message: "Opportunity published successfully",
      data: {
        opportunity: opportunity
      }
    });
  } catch (err) {
    console.log("Error publishing opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.closeOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const currentOrganizationId = req.user._id;

    
    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    if (opportunity.organizationId.toString() !== currentOrganizationId.toString()) {
      return res.status(403).json({
        message: "You can only close your own opportunities"
      });
    }

    
    opportunity.status = "Closed";
    await opportunity.save();

    console.log("Opportunity closed:", opportunityId);

    res.status(200).json({
      status: "success",
      message: "Opportunity closed successfully",
      data: {
        opportunity: opportunity
      }
    });
  } catch (err) {
    console.log("Error closing opportunity:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
exports.getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      organizationId: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: opportunities.length,
      data: {
        opportunities: opportunities
      }
    });
  } catch (err) {
    console.log("Error getting my opportunities:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};