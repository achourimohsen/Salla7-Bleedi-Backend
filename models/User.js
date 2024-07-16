const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            publicId: null
        }
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
}, 
{ 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Populate Reports that belong to this user when they get their profile
userSchema.virtual("reports", {
    ref: "Report",
    foreignField: "user",
    localField: "_id"
});

// Generate auth token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', userSchema);

// Validate register user
function validateRegisterUser(obj) {
    const schema = Joi.object({
        username: Joi.string().min(2).max(100).required(),
        email: Joi.string().min(5).max(100).required().email(),
        password: Joi.string().min(8).required(),
        isAdmin: Joi.boolean().optional()
    });
    return schema.validate(obj);
}

// Validate login user
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(100).required().email(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(obj);
}

// Validate update user
function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: Joi.string().trim().min(8),
        bio: Joi.string().max(500)
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
};
