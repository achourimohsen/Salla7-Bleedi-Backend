const express = require('express');
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { createCommentCtrl, getAllCommentsCtrl, deleteCommentsCtrl, updateCommentCtrl } = require('../controllers/commentController');
const validateObjectId = require('../middlewares/validateObjectId');

// /api/comments
router.route("/")
    .post(verifyToken, createCommentCtrl)
    .get(verifyToken, getAllCommentsCtrl);

// /api/comments/:id
router.route("/:id")
    .delete(validateObjectId, verifyToken, deleteCommentsCtrl)
    .put(validateObjectId, verifyToken, updateCommentCtrl);

module.exports = router;
