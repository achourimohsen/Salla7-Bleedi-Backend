const express = require('express');
const router = express.Router();
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require('../controllers/cateroriesController');
const validateObjectId = require('../middlewares/validateObjectId');


// categories
router.route("/")
    .post(verifyTokenAndAdmin, createCategoryCtrl)
    .get(getAllCategoriesCtrl)

// categories/:id
router.route("/:id")
    .delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl)


module.exports = router
