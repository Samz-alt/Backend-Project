import mongoose, { isValidObjectId } from "mongoose"
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id

    if (!channelId) {
        throw new APIError(404, "ChannelId Not Found")
    }

    if (!isValidObjectId(channelId)) {
        throw new APIError(401, "ChannelId Not A Valid Object")
    }

    if (!userId) {
        throw new APIError(404, "UserId Not Found")
    }

    if (!isValidObjectId(userId)) {
        throw new APIError(401, "UserId Not A Valid Object")
    }

    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
    ])
    console.log(subscription);


    if (subscription?.length) {
        const subscriberToggle = await Subscription.findOneAndDelete({
            channel: channelId
        })
        return res
            .status(200)
            .json(
                new APIResponse(
                    200,
                    subscriberToggle,
                    "User Unsubscribed"
                )
            )
    }
    else {
        const subscriberToggle = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        return res
            .status(200)
            .json(
                new APIResponse(
                    200,
                    subscriberToggle,
                    "User Subscribed"
                )
            )
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new APIError(404, "ChannelId Not Found")
    }

    if (!isValidObjectId(channelId)) {
        throw new APIError(401, "ChannelId Not A Valid Object")
    }

    const subcribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ])

    if (!subcribers?.length) {
        throw new APIError(404, "This Channel Doesn't Have Any Subscribers")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                subcribers,
                "Fetched All Subscribers"
            )
        )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new APIError(404, "ChannelId Not Found")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new APIError(401, "ChannelId Not A Valid Object")
    }

    const subscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: {
                    $first: "$channel"
                }
            }
        }
    ])
    if (!subscribed?.length) {
        throw new APIError(404, "This Channel Doesn't Have Any Subscribers")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                subscribed,
                "Fetched All Channels Subscribered"
            )
        )
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
