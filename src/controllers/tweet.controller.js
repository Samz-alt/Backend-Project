import mongoose, { isValidObjectId } from "mongoose";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";
import { log } from "console";

const createTweet = asyncHandler(async (req, res, err) => {
    const { content } = req.body

    if (!content) {
        throw new APIError(400, "Required Fields are missing")
    }

    if (content.trim() === "") {
        throw new APIError(400, "Required Fields are empty")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new APIError(400, "UserId is Empty")
    }


    let uploadImages = []
    let uploadImagePublicUrl = []

    if (req.files) {
        const images = Array.isArray(req.files) ? req.files : [] // for checking if its an array or not

        // another try catch because we need custom errors, rollback, or conditional behavior.
        try {
            for (const image of images) {
                const png = await uploadOnCloudinary(image.path)
                uploadImages.push(png.url)
                uploadImagePublicUrl.push(png.public_id)
            }
        } catch (error) {
            for (const img of uploadImagePublicUrl) (
                await deleteFromCloudinary(img)
            )
            throw new APIError(500, "Images Uploading Failed")
        }
    }


    const tweet = await Tweet.create(
        {
            owner: userId,
            content: content,
            image: uploadImages,
            imagePublicId: uploadImagePublicUrl
        }
    )

    if (!tweet) {
        throw new APIError(500, "Internel Server Error")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                tweet,
                "Tweeted Successfully"
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { oldImagesPublicId, oldImagesURL, content } = req.body


    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new APIError(400, "TweetId is empty")
    }

    if (!content || content.trim() === "") {
        throw new APIError(400, "Required Fields Cannot Be Empty")
    }

    let updatedTweet = []
    let oldPublicId
    let oldURL
    let uploadedImagesPublicId = []
    let uploadedImagesURL = []


    if (oldImagesPublicId && oldImagesURL) {
        try {
            oldPublicId = Array.isArray(oldImagesPublicId) ? oldImagesPublicId : JSON.parse(oldImagesPublicId)
            oldURL = Array.isArray(oldImagesURL) ? oldImagesURL : JSON.parse(oldImagesURL)

            const imageDelete = await Tweet.findOneAndUpdate(
                {
                    _id: tweetId,
                    owner: req.user?._id
                },
                {
                    $pullAll: {
                        image: oldURL,
                        imagePublicId: oldPublicId
                    }
                }
            )
            updatedTweet.push(imageDelete)
            for (const id of oldPublicId) {
                await deleteFromCloudinary(id)
            }
        }
        catch (error) {
            throw new APIError(500, "Image Deletion Failed")
        }
    }

    if (req.files && req.files.length > 0) {
        const images = Array.isArray(req.files) ? req.files : []
        try {
            for (const image of images) {
                const png = await uploadOnCloudinary(image.path)
                uploadedImagesURL.push(png.url)
                uploadedImagesPublicId.push(png.public_id)
            }
            const imageUpload = await Tweet.findOneAndUpdate(
                {
                    _id: tweetId,
                    owner: req.user?._id
                },
                {
                    $push: {
                        image: {
                            $each: uploadedImagesURL || undefined
                        },
                        imagePublicId: {
                            $each: uploadedImagesPublicId || undefined
                        }

                    }
                },
                {
                    new: true
                }
            )
            updatedTweet.push(imageUpload)
        } catch (error) {
            for (const id of uploadedImagesPublicId) {
                await deleteFromCloudinary(id)
            }
            throw new APIError(500, "Internal Server Error")
        }
    }

    const contentUpdate = await Tweet.updateOne(
        {
            _id: tweetId,
            owner: req.user?._id
        },
        {
            $set: {
                content
            },
        },
        {
            new: true
        }
    )
    if (!contentUpdate) {
        throw new APIError(500, "Internal Server Error")
    }

    updatedTweet.push(contentUpdate)

    if (!updatedTweet) {
        throw new APIError(500, "Internal Server Error")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                updatedTweet,
                "Tweets Updated Successfully"
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new APIError(400, "TweetId is empty")
    }

    const tweet = await Tweet.findOne({   // tweet is now an instance of MONGOOSE DOCUMENT
        _id: tweetId,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new APIError(404, "Tweet Not Found")
    }

    try {
        for (const image of tweet.imagePublicId) {
            await deleteFromCloudinary(image)
        }
    } catch (error) {
        throw new APIError(500, "Internal Server Error")
    }

    const deletedTweet = await tweet.deleteOne()

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                deletedTweet,
                "Tweet Deleted SuccessFully"
            )
        )
})


const getAllUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId || !isValidObjectId(userId)) {
        throw new APIError(400, "userId is empty")
    }

    const allTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
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

    if (!allTweets?.length) {
        return res
            .status(200)
            .json(
                new APIResponse(
                    200,
                    {},
                    "User Doesn't Have any Tweets"
                )
            )
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                allTweets,
                "Tweets Fetched SuccessFully"
            )
        )
})



export { createTweet, updateTweet, deleteTweet, getAllUserTweets }
