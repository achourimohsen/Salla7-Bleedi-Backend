const express = require('express');
const router = express.Router();
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const {
    createReportCtrl,
    getAllReportsCtrl,
    getSingleReportsCtrl,
    getReportCountCtrl,
    deleteReportCtrl,
    updateReportCtrl,
    updateReportImageCtrl,
    toggleLikeCtrl,
    updateReportStatus,
    getFixedReportsCount,
} = require('../controllers/reportController');
const validateObjectId = require("../middlewares/validateObjectId");

// /api/reports
router.route("/")
    .post(verifyToken, photoUpload.single("image"), createReportCtrl)
    .get(getAllReportsCtrl);

// /api/reports/count
router.route("/count").get(getReportCountCtrl);

// /api/reports/:id
router.route("/:id")
    .get(validateObjectId, getSingleReportsCtrl)
    .delete(validateObjectId, verifyToken, deleteReportCtrl)
    .put(validateObjectId, verifyToken, updateReportCtrl);

// /api/reports/update-image/:id
router.route("/update-image/:id")
    .put(validateObjectId, verifyToken, photoUpload.single("image"), updateReportImageCtrl);

// /api/reports/like/:id
router.route("/like/:id")
    .put(validateObjectId, verifyToken, toggleLikeCtrl);

// /api/reorts/:id/statusp
router.put('/:id/status',validateObjectId, verifyTokenAndAdmin, updateReportStatus);


// /api/reorts/count
router.get('/reports/count-fixed', getFixedReportsCount);


module.exports = router;
