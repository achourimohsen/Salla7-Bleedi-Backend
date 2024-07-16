const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const { User, validateRegisterUser, validateLoginUser } = require("../models/User")


/***********************************
 * @desc Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
 **********************************/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }

  let user = await User.findOne({ email: req.body.email })
  if (user) {
    return res.status(400).json({ message: "user already exist" })
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    isAdmin: req.body.isAdmin,
  })
  await user.save()

  // Response to the client
  res.status(201).json({
    message: "suessfulllllllllll",
    data: user
  })

})


/***********************************
 * @desc Login User
 * @router /api/auth/login
 * @method POST
 * @access pubic
 **********************************/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }

  let user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(400).json({ message: "ivalid email or pssw" })
  }

  const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "ivalid email or pssw" })
  }


  const token = user.generateAuthToken()

  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username
  })
})


