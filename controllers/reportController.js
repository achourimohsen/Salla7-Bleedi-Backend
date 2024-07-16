const asyncHandler = require("express-async-handler")
const path = require("path")
const fs = require("fs") //file system 

const { Report, validateCreateReport, validateUpdateReport } = require("../models/Report")
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary")
const { Comment } = require("../models/Comment")

/***********************************
 * @desc Create New Report
 * @router /api/reports
 * @method POST
 * @access private (only logged in user)
************************************/
module.exports.createReportCtrl = asyncHandler(async (req, res) => {
    // 1. Validation for image
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" })
    }
    // 2. Validation for data
    const { error } = validateCreateReport(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    // 3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    // 4. Create new report & save it to DB
    const report = await Report.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id,
        }
    })

    // 5. Send response to the client
    res.status(201).json(report)

    // 6. Remove image from the server
    fs.unlinkSync(imagePath)
})

/***********************************
 * @desc Get All Reports
 * @router /api/reports
 * @method GET
 * @access public
************************************/
module.exports.getAllReportsCtrl = asyncHandler(async (req, res) => {
    const REPORTS_PER_PAGE = 3
    const { pageNumber, category } = req.query
    let reports

    if (pageNumber) {
        reports = await Report.find()
            .skip((pageNumber - 1) * REPORTS_PER_PAGE)
            .limit(REPORTS_PER_PAGE)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])
    } else if (category) {
        reports = await Report.find({ category })
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])
    } else {
        reports = await Report.find()
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])
    }
    res.status(200).json(reports)
})

/***********************************
 * @desc Get Single Report
 * @router /api/reports/:id
 * @method GET
 * @access public
************************************/
module.exports.getSingleReportsCtrl = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments") // comments defined in virtual in ReportSchema
    
    if (!report) {
        return res.status(404).json({ message: "report not found" })
    }
    res.status(200).json(report)
})

/***********************************
 * @desc Get Report Count
 * @router /api/reports/count
 * @method GET
 * @access public
************************************/
module.exports.getReportCountCtrl = asyncHandler(async (req, res) => {
    const count = await Report.countDocuments()
    res.status(200).json(count)
})

/***********************************
 * @desc Delete Report
 * @router /api/reports/:id
 * @method DELETE
 * @access private (only admin or owner of the  report )
************************************/
module.exports.deleteReportCtrl = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id).populate("user", ["-password"])
    if (!report) {
        return res.status(404).json({ message: "report not found" })
    }

    if (req.user.isAdmin || req.user.id === report.user.toString()) {
        await Report.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(report.image.publicId)

        // Delete all comments that belong to this report
        await Comment.deleteMany({ reportId: report._id })

        res.status(200).json({
            message: "report has been deleted successfully",
            reportId: report._id
        })
    } else {
        res.status(403).json({ message: "access denied, forbidden" })
    }
})

/***********************************
 * @desc Update Report
 * @router /api/reports/:id
 * @method PUT
 * @access private (only owner of the  report)
************************************/
module.exports.updateReportCtrl = asyncHandler(async (req, res) => {
    // 1. validation
    const { error } = validateUpdateReport(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    // 2. Get the report from DB and check if it exists
    const report = await Report.findById(req.params.id)
    if (!report) {
        return res.status(404).json({ message: "report not found" })
    }

    // 3. check if this report belongs to logged in user
    if (req.user.id !== report.user.toString()) {
        return res.status(403).json({ message: "access denied, you are not allowed" })
    }

    // 4. Update report
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            status: req.body.status
        }
    }, { new: true }).populate("user", ["-password"])

    // 5. Send response to the client
    res.status(200).json({ updatedReport })
})

/***********************************
 * @desc Update Report Image
 * @router /api/reports/upload-image/:id
 * @method PUT
 * @access private (only owner of the report)
************************************/
module.exports.updateReportImageCtrl = asyncHandler(async (req, res) => {
    // 1. validation
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" })
    }

    // 2. Get the report from DB and check if it exists
    const report = await Report.findById(req.params.id)
    if (!report) {
        return res.status(404).json({ message: "report not found" })
    }

    // 3. check if this report belongs to logged in user
    if (req.user.id !== report.user.toString()) {
        return res.status(403).json({ message: "access denied, you are not allowed" })
    }

    // 4.Delete the Old Image
    await cloudinaryRemoveImage(report.image.publicId)

    // 5.Upload new Photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    // 6. Update the image field in the DB
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, { new: true })

    // 7. Send response to the client
    res.status(200).json({ updatedReport })

    // 8. Remove image from the server
    fs.unlinkSync(imagePath)
})

/***********************************
 * @desc Toggle Like
 * @router /api/reports/like:id
 * @method PUT
 * @access private (only logged in user)
************************************/
module.exports.toggleLikeCtrl = asyncHandler(async(req, res) => {
    const loggedInUser = req.user.id
    const { id: reportId } = req.params 
    
    let report = await Report.findById(reportId)
    if (!report) {
        return res.status(404).json({ message: "report not found" })
    }

    const isReportAlreadyLiked = report.likes.find((user) => user.toString() === loggedInUser)

    if (isReportAlreadyLiked) {
        report = await Report.findByIdAndUpdate(
            reportId,
            {
                $pull: { likes: loggedInUser }
            },
            { new: true })
    } else {
        report = await Report.findByIdAndUpdate(
            reportId,
            {
                $push: { likes: loggedInUser }
            },
            { new: true })
    }

    res.status(200).json(report)
})









/***********************************
 * @desc Status
 * @router /api/reports/:id/status
 * @method PUT
 * @access private (only Admin)
************************************/
module.exports.updateReportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Open', 'Fixed', 'Under Review'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Find report by ID
    const report = await Report.findById(id);

    // Check if report exists
    if (!report) {
        return res.status(404).json({ message: 'Report not found' });
    }

    // Update status and save
    report.status = status;
    await report.save();

    res.status(200).json(report);
});

// ****************
module.exports.getFixedReportsCount = asyncHandler(async (req, res) => {
    try {
        const count = await Report.countDocuments({ status: "Fixed" });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});