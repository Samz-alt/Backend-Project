import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js"
import mongoose, { isValidObjectId } from "mongoose";


const videoPublish = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title || !description) {
        throw new APIError(401, "Required fields are empty")
    }

    if ([title, description].some((field) => field.trim() === "")) {
        throw new APIError(401, "Required fields are blank")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0].path
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path

    if (!videoFileLocalPath) {
        throw new APIError(400, "Video File is Required")
    }
    if (!thumbnailLocalPath) {
        throw new APIError(400, "Thumbnail is Required")
    }

    const videoUpload = await uploadOnCloudinary(videoFileLocalPath)
    console.log(videoUpload);


    if (!videoUpload.url) {
        throw new APIError(400, "Video Not Uploaded")
    }

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnailUpload.url) {
        throw new APIError(400, "Thumbnail Not Uploaded")
    }

    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        title,
        description,
        owner: new mongoose.Types.ObjectId(req.user?._id),
        duration: videoUpload.duration,
        videoPublicId: videoUpload.public_id,
        thumbnailPublicId: thumbnailUpload.public_id

    })

    return res
        .status(200)
        .json(
            new APIResponse(
                201,
                video,
                "Video Uploaded Successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "VideoId Not Available")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(404, "Video Doesn't Exist")
    }

    if (!video.owner.equals(userId)) {
        throw new APIError(401, "User is Not Authorized for performing the action")
    }

    const deleteVideoFile = await deleteFromCloudinary(video.videoPublicId, "video")
    if (deleteVideoFile.result !== "ok") {
        throw new APIError(500, "Video didn't get deleted due to server Error")
    }

    const deleteThumbnail = await deleteFromCloudinary(video.thumbnailPublicId)
    if (deleteThumbnail.result !== "ok") {
        throw new APIError(500, "Thumbnail didn't get deleted due to server Error")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new APIError(404, "Video not found or user is not authorized.")
    }

    return res.status(200).json(
        new APIResponse(
            201,
            {},
            "Video deleted Successfully"
        )
    );

})

const getVideobyId = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "VideoId Not Available")
    }

    // const videoDbFile = await Video.findById(videoId).select("-videoPublicId -thumbnailPublicId")


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if (!video) {
        throw new APIError(404, "Video Doesn't Exist")
    }

    return res.status(200).json(new APIResponse(201, video, "Video Fetched SuccessFully"))
})

const videoUpdate = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "VideoId Not Available")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new APIError(404, "Video Doesn't Exist")
    }

    if (video.owner !== req.user?._id) {
        throw new APIError(401, "User is Not Authorized for performing the action")
    }

    const deleteVideo = await deleteFromCloudinary(video.videoPublicId, "video")
    if (deleteVideo !== "ok") {
        throw new APIResponse(500, "Video didn't get deleted due to server Error")
    }

    const videoFileLocalPath = req.file?.path
    const uploadVideo = await uploadOnCloudinary(videoFileLocalPath)
    if (!uploadVideo.url) {
        throw new APIError(400, "Video Uploading Failed")
    }

    const updatedVideoDB = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                videoFile: uploadVideo.url,
                videoPublicId: uploadVideo.public_id
            }
        },
        {
            new: true
        }
    )

    if (!updatedVideoDB) {
        throw new APIError(401, "video Updating Failed")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                201,
                updatedVideoDB,
                "Video Updated SuccessFully"
            )
        )
})

const thumbnailUpdate = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "VideoId Not Available")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new APIError(404, "Video Doesn't Exist")
    }

    if (video.owner !== req.user?._id) {
        throw new APIError(401, "User is Not Authorized for performing the action")
    }

    const deleteThumbnail = await deleteFromCloudinary(video.thumbnailPublicId)
    if (deleteThumbnail.result !== "ok") {
        throw new APIError(500, "Thumbnail didn't get deleted due to server Error")
    }

    const thumbnailLocalPath = req.files?.path
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (uploadThumbnail !== "ok") {
        throw new APIError(500, "Thumbnail didn't get uploaded due to server Error")
    }

    const updatedthumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {

                thumbnail: uploadThumbnail.url,
                thumbnailPublicId: uploadThumbnail.public_id

            }
        },
        {
            new: true
        })

    if (!updatedthumbnail) {
        throw new APIError(401, "video Updating Failed or User is not authorized")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                201,
                updatedthumbnail,
                "Thumbnail Updated SuccessFully"
            )
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "VideoId Not Available")
    }

    const updatePublished = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: userId  //this is done to check whether the userId is the owner of the video
        },
        {
            $set: {
                isPublished:
                {
                    $not: "$isPublished"   // not operator is used for inverts the current boolean value
                }
            }
        }
    )

    if (!updatePublished) {
        throw new APIError(404, "Video Doesn't Exists or User is not authorized")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                updatePublished,
                "Publish status updated successfully"
            )
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // receive all the params
    // create an aggreagation pipeline with a variable pipeline and push all the stages there
    // 1st stage is to use search query to search document with the query parameter
    // 2nd stage is to filter out the docs with userId
    // figure out the sorting type and sorting by 
    // creating options with page and limit to find desired number of documents
    // send response 

    const pipeline = []


    if (query) {
        pipeline.push({
            // search should be the 1st aggregation stage to be provided as it works on a separate engine and then pass the resulted docs back to the next stage or the passed to next aggregation pipeline. And it only works on indexed collections, not intermediate results i.e. why MongoDB will give an error.
            $search: {
                index: "search-videos",
                // text is based on fullText based index search
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        })
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new APIError(404, "UserId not a valid Object")
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        )
    }

    // sortby i.e. sorting field can be views, createdAt, duration
    // sortType can be ascending or descending order i.e. if by createdAt then Oldest First or Newest First(YOUTUBE REFERENCE)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    }
    else {
        pipeline.push({
            $sort: {
                // score is not a permanent field, its just a temporary field name which holds the reference for relevance score for sorting and $meta stores all the data from the last pipeline stage
                // here sort is performing two stage sorting for if the relevance is tied between two fields. 
                score: { $meta: "searchScore" }, title: 1
            }
        })
    }


    // This Aggregate object exists not to replace the pipeline, but to control how MongoDB runs the pipeline, which the pipeline itself is not allowed to express.
    const videoAggregate = Video.aggregate(pipeline)

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const videoPaginate = await Video.aggregatePaginate(videoAggregate, options)
    console.log(videoPaginate.docs);
    if (!videoPaginate) {
        throw new APIError(500, "Internal Server Problem")
    }

    return res
        .status(200)
        .json(
            new APIResponse(201, videoPaginate.docs, "Videos Fetched Successfully")
        )
})

export { videoPublish, deleteVideo, getVideobyId, videoUpdate, thumbnailUpdate, togglePublishStatus, getAllVideos }