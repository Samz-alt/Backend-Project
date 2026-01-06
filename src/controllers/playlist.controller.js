import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new APIError(400, "Required Credentials are not Provided")
    }

    if ([name, description].some((field) => field.trim() === "")) {
        throw new APIError(400, "Required fields are empty")
    }

    const userId = req.user?._id
    if (!isValidObjectId(userId)) {
        throw new APIError(404, "Not a valid ObjectId")
    }

    const playlist = await Playlist.create(
        {
            name: name.trim(),
            description: description,
            owner: userId
        }
    )

    if (!playlist) {
        throw new APIError(500, "DB Not Created due to Internal Server Error")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                playlist,
                "Playlist has been Created Successfully"
            )
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new APIError(401, "UserID Not Available")
    }

    if (!isValidObjectId(userId)) {
        throw new APIError(404, "Not a valid ObjectId")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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

    if (!playlists?.length) {
        throw new APIError(404, "No Playlists Available")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                playlists
            )
        )
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new APIError(404, "Id Not Found")
    }

    if (!isValidObjectId(playlistId)) {
        throw new APIError(401, "Not a valid ObjectId")
    }

    const getPlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        }
    ])

    if (!getPlaylist?.length) {
        throw new APIError(404, "Playlist Not Found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                getPlaylist[0],
                "Playlist Fetched Successfully"
            )
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new APIError(404, "Required Parameters are not Provided")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(401, "Parameters are not Valid ObjectId")
    }
    const userId = req.user?._id

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $addToSet: { //ensures that there are no duplicates which $push doesn't
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new APIError(404, "Playlist Not Found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                playlist,
                "Video Added Successfully"
            )
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new APIError(404, "Required Parameters are not Provided")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(401, "Parameters are not Valid ObjectId")
    }

    const userId = req.user?._id

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new APIError(404, "Playlist Not Found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                playlist,
                "Video Deleted SuccessFully"
            )
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new APIError(404, "Required Parameters are not Provided")
    }

    if (!isValidObjectId(playlistId)) {
        throw new APIError(401, "Parameters are not Valid ObjectId")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user?._id
        },
    )

    if (!deletePlaylist) {
        throw new APIError(404, "Playlist Not Found")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new APIError(404, "Required Parameters are not Provided")
    }

    if (!name && !description) {
        throw new APIError(404, "Required Fields are not Provided")
    }

    if ([name, description].some((field) => field.trim() === "")) {
        throw new APIError(404, "Fields can't be empty")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new APIError(404, "Playlist Not Available")
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                playlist,
                "Playlist Updated SuccessFully"
            )
        )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}