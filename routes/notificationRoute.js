const express = require('express');
const { createNotifCtrl, getAllNotifCtrl } = require('../controllers/notificationController');
const router = express.Router();


// Notification
router.route("/").post(createNotifCtrl)
router.route("/:userId").get(getAllNotifCtrl)


module.exports = router;
