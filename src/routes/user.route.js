import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeUserAccountPassword, updateUserDetails, changeUserAvatar, changeUserCoverImage, getCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([{            //middleware is placed before the controller
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
    ]),
    registerUser)


router.route("/login").post(upload.none(), loginUser) //even if no file data is being saved then also use multer with nono

//secure routes

router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/user").get(verifyJwt, getCurrentUser)
router.route("/update-password").post(verifyJwt, changeUserAccountPassword)
router.route("/update-userdetails").patch(verifyJwt, updateUserDetails)
router.route("/update-avatarImage").patch(verifyJwt, upload.single("avatar"), changeUserAvatar)
router.route("/update-coverImage").patch(verifyJwt, upload.single("coverImage"), changeUserCoverImage)


export default router