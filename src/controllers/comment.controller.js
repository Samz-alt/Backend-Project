import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addComment = asyncHandler(async (req, res) => {
    const content = req.body
    const { videoId } = req.params

    if (!content) {
        throw new APIError(404, "Required Field Not Found")
    }

    if ([content].some((field) => field.trim() === "")) {
        throw new APIError(404, "Required Field is Empty")
    }

    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "Not a valid ObjectId")
    }

    const comment = await Comment.create(
        {
            comment: content,
            video: videoId,
            owner: req.user?._id
        }
    )

    if (!comment) {
        throw new APIError(500, "Bad Server Request")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                comment,
                "Commented SuccessFully"
            )
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId, content } = req.body

    if (!commentId) {
        throw new APIError(404, "CommentId Not Received")
    }

    if (!content) {
        throw new APIError(404, "Required Field Not Found")
    }

    if ([content].some((field) => field.trim() === "")) {
        throw new APIError(404, "Required Field is Empty")
    }
    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id
        },
        {
            $set: {
                comment: content
            }
        },
        {
            new: true
        }
    )

    if (!comment) {
        throw new APIError(404, "Comment Not Found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                comment,
                "Comment Updated Successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.body
    if (!commentId) {
        throw new APIError(404, "CommentId Not Received")
    }

    const comment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user?._id
        }
    )

    if (!comment) {
        throw new APIError(404, "Comment Not Found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                comment,
                "Comment Deleted Successfully"
            )
        )
})

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new APIError(404, "Id Not Found")
    }

    if (!isValidObjectId(videoId)) {
        throw new APIError(404, "Not a valid ObjectId")
    }

    const commentsPipeline = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
        }
    ])


    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const comments = await Comment.aggregatePaginate(commentsPipeline, options)

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                comments,
                "Comments Fetched Successfully"
            )
        )
})

export { addComment, getVideoComments, updateComment, deleteComment }