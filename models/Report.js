const mongoose = require("mongoose");
const Joi = require("joi");

// Report schema
const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null
        }
    },      
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    status: {
        type: String,
        enum: ["Open", "Fixed", "Under Review"],
        default: "Open"
    }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Populate Comment for this Report
reportSchema.virtual("comments", {
    ref: "Comment",
    foreignField: "reportId",
    localField: "_id"
  });

// Report model
const Report = mongoose.model('Report', reportSchema);

// Validate create report
function validateCreateReport(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200).required(),
        description: Joi.string().trim().min(10).required(),
        category: Joi.string().trim().required(),
    });
    return schema.validate(obj);
}

// Validate update report
function validateUpdateReport(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200),
        description: Joi.string().trim().min(10),
        category: Joi.string().trim(),
        status: Joi.string().valid("Open", "Fixed", "Under Review"),
    });
    return schema.validate(obj);
}

module.exports = {
    Report,
    validateCreateReport,
    validateUpdateReport,
};
