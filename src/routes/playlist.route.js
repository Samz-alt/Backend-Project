import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()

router.route("/createPlaylist").post(verifyJwt, upload.none(), createPlaylist)
router.route("/userPlaylist/:userId").get(verifyJwt, getUserPlaylists)
router.route("/Playlist/:playlistId").get(verifyJwt, getPlaylistById)
router.route("/addVideo/:playlistId/:videoId").patch(verifyJwt, addVideoToPlaylist)
router.route("/removeVideo/:playlistId/:videoId").delete(verifyJwt, removeVideoFromPlaylist)
router.route("/deletePlaylist/:playlistId").delete(verifyJwt, deletePlaylist)
router.route("/updatePlaylist/:playlistId").patch(verifyJwt, updatePlaylist)

export default router