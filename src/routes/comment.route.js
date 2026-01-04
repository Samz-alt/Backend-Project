import { Router } from "express";
import { addComment, getVideoComments, updateComment, deleteComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.use(verifyJwt) // Apply verifyJWT middleware to all routes in this file

router.route("/watch/:videoId").post(upload.none(), addComment).get(getVideoComments)
router.route("/comment").patch(upload.none(), updateComment).delete(deleteComment)

export default router