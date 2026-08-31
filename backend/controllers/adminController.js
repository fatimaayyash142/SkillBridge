const User = require("../models/userModel");
const Opportunity = require("../models/opportunityModel");
const Application = require("../models/applicationModel");

// Get all users (admin view)
exports.getAllUsers = async (req, res) => {
  try {
    // Get all users but don't send passwords
    const allUsers = await User.find().select("-password");

    console.log("Admin retrieved all users, total count:", allUsers.length);

    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: {
        users: allUsers
      }
    });
  } catch (err) {
    console.log("Error getting all users:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.getAllOpportunities = async (req, res) => {
  try {
 
    const allOpportunities = await Opportunity.find()
      .populate("organizationId", "name email phone website description");

    console.log("Admin retrieved all opportunities, total count:", allOpportunities.length);

    res.status(200).json({
      status: "success",
      results: allOpportunities.length,
      data: {
        opportunities: allOpportunities
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

exports.getAllApplications = async (req, res) => {
  try {
   
    const allApplications = await Application.find()
      .populate("candidateId", "name email phone educationLevel major university skills experience")
      .populate("opportunityId");

    console.log("Admin retrieved all applications, total count:", allApplications.length);

    res.status(200).json({
      status: "success",
      results: allApplications.length,
      data: {
        applications: allApplications
      }
    });
  } catch (err) {
    console.log("Error getting all applications:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Status must be either 'Active' or 'Suspended'"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own account status"
      });
    }

   
    user.status = status;
    await user.save();

    
    const userDataToSend = user.toObject();
    delete userDataToSend.password;

    console.log("User status updated:", userId, "new status:", status);

    res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      data: {
        user: userDataToSend
      }
    });
  } catch (err) {
    console.log("Error updating user status:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

   
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

   
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

  
    await user.deleteOne();

    console.log("User deleted:", userId);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully"
    });
  } catch (err) {
    console.log("Error deleting user:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    
    await opportunity.deleteOne();

    console.log("Opportunity deleted by admin:", opportunityId);

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