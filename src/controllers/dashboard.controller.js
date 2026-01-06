import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const { channelId } = req.body
    if (!channelId || !isValidObjectId(channelId)) {
        throw new APIError(400, "channelId is empty")
    }

    let channelStats = []


    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            // combines multiple documents into one
            $group: {
                _id: null,
                views: { $sum: "$views" }   // adds values across documents
            }
        },
        {
            $project: {
                views: 1
            }
        }
    ])

    console.log(totalViews);


    if (!totalViews) {
        throw new APIError(500, "Internal Server Error")
    }
    channelStats.push(totalViews[0])

    const totalSubs = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "subscribers"   // counts the number of documents that is passed through the first stage
        }
    ])
    console.log(totalSubs)

    channelStats.push(totalSubs[0])


    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "videos"
        }
    ])
    console.log(totalVideos)

    channelStats.push(totalVideos[0])

    const totalLikes = await Like.aggregate([
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
                                        _id: 1,
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
                        $match: {
                            owner: channelId
                        }
                    }
                ]
            }
        },
        {
            $count: "likes"
        }
    ])

    console.log(totalLikes)

    channelStats.push(totalLikes[0])

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                channelStats,
                "Status Fetched SuccessFully"
            )
        )
})


const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.body
    if (!channelId || !isValidObjectId(channelId)) {
        throw new APIError(400, "ChannelId is empty")
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
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
                            _id: 1,
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
    ])

    if (!videos?.length) {
        return res
            .status(200)
            .json(
                200,
                {},
                "Channel Doesn't Have Any Videos"
            )
    }

    return res
        .status(200)
        .json(
            200,
            videos,
            "Channel All Videos Fetched"
        )
})

export { getChannelStats, getChannelVideos }