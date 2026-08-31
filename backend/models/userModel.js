const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },

        passwordChangedAt: Date,

        role: {
            type: String,
            enum: ["Candidate", "Organization", "Admin"],
            required: true
        },

        phone: {
            type: String,
            trim: true
        },

        // Candidate information
        educationLevel: {
            type: String,
            trim: true
        },

        major: {
            type: String,
            trim: true
        },

        university: {
            type: String,
            trim: true
        },

        skills: [
            {
                type: String,
                trim: true
            }
        ],

        experience: [
            {
                jobTitle: {
                    type: String,
                    trim: true
                },

                company: {
                    type: String,
                    trim: true
                },

                description: {
                    type: String,
                    trim: true
                },

                startDate: Date,

                endDate: Date
            }
        ],

        // Organization information
        website: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: ["Active", "Suspended"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);



userSchema.pre("save", async function() {
   
    if (!this.isModified("password")) {
        return;
    }

 
    this.password = await bcrypt.hash(this.password, 10);

    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
});


userSchema.methods.comparePassword = async function(password) {
     return await bcrypt.compare(password,this.password);
    };


userSchema.methods.changedPasswordAfter =
    function(JWTTimestamp) {

        if (this.passwordChangedAt) {

            const changedTimestamp =
                parseInt(
                    this.passwordChangedAt.getTime() / 1000,
                    10
                );

            return JWTTimestamp < changedTimestamp;
        }

        return false;
    };


module.exports = mongoose.model("User",userSchema);