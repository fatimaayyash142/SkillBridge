const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        "Internship",
        "Training",
        "Project",
        "Entry-Level Job"
      ],
      required: true
    },

    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],

    location: {
      type: String,
      trim: true
    },

    workArrangement: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"]
    },

    deadline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Draft"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);