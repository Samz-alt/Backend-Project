import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleTweetLike, toggleVideoLike, toggleCommentLike } from "../controllers/like.controller.js";


const router = Router()

router.use(verifyJwt)

router.route("/watch/:videoId").post(toggleVideoLike)
router.route("/comments/:commentId").post(toggleCommentLike)
router.route("/tweet/:tweetId").post(toggleTweetLike)
router.route("/likedVideos").get(getLikedVideos)


export default router