const User = require("../models/userModel");

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const userDataToSend = currentUser.toObject();
    delete userDataToSend.password;

    console.log("User profile retrieved:", userId);

    res.status(200).json({
      status: "success",
      data: {
        user: userDataToSend
      }
    });
  } catch (err) {
    console.log("Error getting profile:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;


    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // =======================================
    // Update common fields for all users
    // =======================================

    // Update name if provided
    if (req.body.name !== undefined) {
      currentUser.name = req.body.name;
    }

    // Update phone if provided
    if (req.body.phone !== undefined) {
      currentUser.phone = req.body.phone;
    }

    // =======================================
    // Update Candidate-specific fields
    // =======================================

    if (currentUser.role === "Candidate") {
      // Update education level if provided
      if (req.body.educationLevel !== undefined) {
        currentUser.educationLevel = req.body.educationLevel;
      }

      // Update major if provided
      if (req.body.major !== undefined) {
        currentUser.major = req.body.major;
      }

      // Update university if provided
      if (req.body.university !== undefined) {
        currentUser.university = req.body.university;
      }

      // Update skills if provided
      if (req.body.skills !== undefined) {
        currentUser.skills = req.body.skills;
      }

      // Update experience if provided
      if (req.body.experience !== undefined) {
        currentUser.experience = req.body.experience;
      }
    }

    // =======================================
    // Update Organization-specific fields
    // =======================================

    if (currentUser.role === "Organization") {
      // Update website if provided
      if (req.body.website !== undefined) {
        currentUser.website = req.body.website;
      }

      // Update description if provided
      if (req.body.description !== undefined) {
        currentUser.description = req.body.description;
      }
    }

    // Save the updated user to database
    await currentUser.save();

    // Convert to object and remove password
    const userDataToSend = currentUser.toObject();
    delete userDataToSend.password;

    console.log("User profile updated:", userId);

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: userDataToSend
      }
    });
  } catch (err) {
    console.log("Error updating profile:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};