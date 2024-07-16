const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs") //file system 

const { User, validateUpdateUser } = require("../models/User")
const {cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require("../utils/cloudinary")
const { Comment } = require("../models/Comment")
const { Report } = require("../models/Report")

/***********************************
 * @desc Get All Users profile
 * @router /api/users/profile
 * @method Get
 * @access private (only admin)
 **********************************/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").populate("reports")
    res.status(200).json(users)
})


/***********************************
 * @desc Get User profile
 * @router /api/users/profile/:id
 * @method Get
 * @access public
 **********************************/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("reports")
    if(!user) {
        return res.status(404).json({ message: "user not found" })
    }

    res.status(200).json(user)
})


/***********************************
 * @desc Update User profile
 * @router /api/users/profile/:id
 * @method Put
 * @access private (only user himself)
------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body)
    if(error) {
        return res.status(404).json({ message: error.details[0].message })
    }
    if(req.body.password) {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    const updateUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio,
        }
    }, { new: true }).select("-password")
    .populate("reports")

    res.status(200).json(updateUser)
})

/***********************************
 * @desc Get Users Count
 * @router /api/users/count
 * @method Get
 * @access Private (only admin)
 **********************************/
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
    const count = await User.countDocuments()
    res.status(200).json(count)
})


/***********************************
 * @desc Profile Photo Upload
 * @router /api/users/profile/profile-photo-upload
 * @method Post
 * @access private (only logged in user)
 **********************************/
module.exports.profilePhotoUploadCtrl = asyncHandler(async(req, res) => {
    // console.log(req.file)
    // 1 Validation
    if(!req.file) {
        return req.status(400).json({ message: "no file provided" })
    }

    // 2. Get the path to the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)

    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath)
    // console.log(result)

    // 4. Get the user from DB
    const user = await User.findById(req.user.id)
    
    // 5. Delete the old proifle pfoto if exist
    if(user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }

    // 6. Change the profile photo field in the DB
    user.profilePhoto = {
        url: result.secure_url, 
        publicId: result.public_id
    }
    await user.save()

    // 7. Send response the client
    res.status(200).json({ 
        message: "your profile photo uploaded successfully", 
        profilePhoto: {url: result.secure_url, publicId: result.public_id}
    })

    // 8. remove image the server
    fs.unlinkSync(imagePath)

})



/***********************************
 * @descdelete Delete User profile (Account)
 * @router /api/users/profile/:id
 * @method DELETE
 * @access private (only admin of user himself)
 **********************************/
module.exports.deleteUserProfileCtrl = asyncHandler(async(req, res) => {
    // 1. Get the user fom DB
    const user = await User.findById(req.params.id)
    if(!user) {
        return res.status(404).json({ message: "user not found" })
    }

    // @TODO -  2. Get all reports from DB
    const reports = await Report.find({ user: user._id })

    // @TODO -  3. Get the public ids from the reports

    const publicIds = reports?.map((report) =>report.image.publicId)

    // @TODO -  4. Delete all reports image from cloudinarythat belong to this user
    if(publicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(publicIds)
    }

    // 5. Delete the profile picture from cloudinary
    if(user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }

    // 6. @TODO - Delete user reports & comment
    await Report.deleteMany({ user: user._id })
    await Comment.deleteMany({ user: user._id })

    // 7. Delete the user himself
    await User.findByIdAndDelete(req.params.id)

    // 8. Send a response to client

    res.status(200).json({ message: "your profile has been delete" })

})