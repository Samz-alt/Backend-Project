import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const uploadOnCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET_KEY
    })


    try {
        if (!localFilePath) return null
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' }) //file uploader
        console.log("File Uploader SuccessFully", uploadResponse.url);
        // fs.unlinkSync(localFilePath)
        return uploadResponse

    } catch (error) {
        console.error("Cloudinary Upload Error:", error)
        // fs.unlinkSync(localFilePath)
        return null
    }

    //this is done so that if there is any problem like filePath wrong or if the file path has already been deleted or if the file was deleted by some middlewares as FilePath existing doesn't guarantee the file still exists at that path right now.
    finally {
        try {
            fs.unlinkSync(localFilePath)
        }
        catch (error) {
            console.log(error)
        }
    }

}

export { uploadOnCloudinary }