import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { videoPublish, deleteVideo, getVideobyId, videoUpdate, thumbnailUpdate, togglePublishStatus, getAllVideos } from "../controllers/video.controller.js";


const router = Router()

router.route("/uploadVideo").post(
    verifyJwt,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    videoPublish)

router.route("/search").get(verifyJwt, getAllVideos)
router.route("/:videoId")
    .post(verifyJwt, deleteVideo)
    .get(verifyJwt, getVideobyId)

router.route("/updateVideo/:videoId").patch(verifyJwt, upload.single("video"), videoUpdate)
router.route("/updateThumbnail/:videoId").patch(verifyJwt, upload.single("thumbnail"), thumbnailUpdate)
router.route("/toggle/publish/:videoId").patch(verifyJwt, togglePublishStatus)

export default router