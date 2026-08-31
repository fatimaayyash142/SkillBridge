const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true
    },

    coverLetter: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Shortlisted",
        "Accepted",
        "Rejected",
        "Withdrawn"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

// candidate can apply one time for the application.
applicationSchema.index({ candidateId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("Application",applicationSchema);