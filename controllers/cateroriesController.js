const asyncHandler = require("express-async-handler")
const { Category, validateCreateCategory } = require("../models/Category")



/***********************************
 * @desc Create New Category
 * @router /api/categories
 * @method POST
 * @access private (only admin)
************************************/
module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body)
    if(error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    const category = await Category.create({
        title: req.body.title,
        user: req.user.id,
    })

    res.status(201).json(category)
})


/***********************************
 * @desc Get All Categories
 * @router /api/categories
 * @method GET
 * @access public
************************************/
module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find()

    res.status(201).json(categories)
})

/***********************************
 * @desc Delete Category
 * @router /api/categories/:id
 * @method DELETE
 * @access private (only admin)
************************************/
module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
    if(!category) {
        return res.status(400).json({ message: "categ not found" })
    }
    await Category.findByIdAndDelete(req.params.id)

    res.status(201).json({
        message: 'category has been deleted successfully',
        categoryId: category._id
    })
})