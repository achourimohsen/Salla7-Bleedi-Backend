const mongoose = require("mongoose");
const Joi = require("joi")

// Comment schema
const CommentSchema = new mongoose.Schema({
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },

}, 
{ 
    timestamps: true 
})

// Comment model
const Comment = mongoose.model('Comment', CommentSchema);

// validate Create Comment
function validateCreateComment(obj) {
    const schema = Joi.object({
        reportId: Joi.string().required().label("Report Id"),
        text: Joi.string().trim().required().label("Text"),
    })
    return schema.validate(obj)
}

// validate Update Comment
function validateUpdateComment(obj) {
    const schema = Joi.object({       
        text: Joi.string().trim().required().label("Text"),

    })
    return schema.validate(obj)
}




module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment
}