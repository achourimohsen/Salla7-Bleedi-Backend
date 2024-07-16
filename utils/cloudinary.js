const cloudinary = require("cloudinary")


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_PROCESS,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// cloudinary upload image 
const cloudinaryUploadImage = async(fileToUpload) => {
    try{
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: "auto", 
        })
        return data
    } catch(error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary)")
    }
}

// cloudinary remove image 
const cloudinaryRemoveImage = async(imagePublicId) => { //hedha na3tih string
    try{
        const result = await cloudinary.uploader.destroy(imagePublicId)
        return result
    } catch(error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary)")
    }
}

// cloudinary remove Multiple image 
const cloudinaryRemoveMultipleImage = async(publicIds) => { //hedha na3tih array
    try{
        const result = await cloudinary.v2.api.delete_resources(publicIds)
        return result
    } catch(error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary)")
    }
}


module.exports =  {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
}