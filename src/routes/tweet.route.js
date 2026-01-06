import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createTweet, updateTweet, deleteTweet, getAllUserTweets } from "../controllers/tweet.controller.js";


const router = Router()

router.use(verifyJwt)

//to show error properly we can either add a global error for all routes or add route specific error
router.route("/createTweet").post(upload.array("image", 2), createTweet)
router.route("/userTweets").get(getAllUserTweets)
router.route("/tweet/:tweetId").patch(upload.array("image", 2), updateTweet).delete(deleteTweet)

export default router