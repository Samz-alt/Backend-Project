import mongoose, { isValidObjectId } from "mongoose";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId || !isValidObjectId(videoId)) {
        throw new APIError(404, "Id not Found or not a valid ObjectId")
    }

    const userId = req.user?._id

    const findLike = await Like.findOne(
        {
            video: videoId,
            likedBy: userId
        }

    )

    let toggleLike
    let likeData

    if (findLike) {
        likeData = await Like.deleteOne(
            {
                _id: findLike._id
            }
        )
        toggleLike = false
    }
    else {
        likeData = await Like.create(
            {
                video: videoId,
                likedBy: userId
            }
        )
        toggleLike = true
    }



    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                { likeData, toggleLike },
                toggleLike ? "Video Liked" : "Video Unliked"
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId || !isValidObjectId(commentId)) {
        throw new APIError(404, "Id not Found or not a valid ObjectId")
    }
    const userId = req.user?._id

    const findLike = await Like.findOne(
        {
            comment: commentId,
            likedBy: userId
        }
    )

    let toggleLike
    let likeData

    if (findLike) {
        likeData = await Like.deleteOne(
            {
                _id: findLike._id
            }
        )
        toggleLike = false
    }
    else {
        likeData = await Like.create(
            {
                comment: commentId,
                likedBy: userId
            }
        )
        toggleLike = true
    }
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                { likeData, toggleLike },
                toggleLike ? "Comment Liked" : "Comment Unliked"
            )
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new APIError(404, "Id not Found or not a valid ObjectId")
    }
    const userId = req.user?._id

    const findLike = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: userId
        }
    )

    let toggleLike
    let likeData

    if (findLike) {
        likeData = await Like.deleteOne(
            {
                _id: findLike._id
            }
        )
        toggleLike = false
    }
    else {
        likeData = await Like.create(
            {
                tweet: tweetId,
                likedBy: userId
            }
        )
        toggleLike = true
    }
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                { likeData, toggleLike },
                toggleLike ? "Tweet Liked" : "Tweet Unliked"
            )
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
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
                    },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },

    ])

    if (!likedVideos?.length) {
        return res
            .status(200)
            .json(
                new APIResponse(
                    200,
                    {},
                    "No Liked Videos"
                )
            )
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                likedVideos,
                "Fetch All Liked Videos"
            )
        )
})



export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }