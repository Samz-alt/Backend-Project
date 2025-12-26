import { User } from "../models/user.model";
import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


const verifyJwt = asyncHandler(async (req, _, next) => {
    // here "_" is put where "res" is not used.
    // the second part i.e. req.header("Authorization") is for mobile based developement where don't have an access to cookie so they store it in the headers and key is authorization.
    // req also has an accessToken object because of cookie-parser middleware
    // req.header("Authorization") is the Express-friendly way.    req.headers.authorization is the raw Node way.

    const accessToken = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) {
        throw new APIError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    // this DB call isn't technically need but it should be called to check the lastest state of the user and if the user is deleted or if it's state has been changed.
    // JWT proves identity, DB confirms authorization
    const user = await User.findById(decodedToken?._id).select("-password", "-refreshToken")

    if (!user) {
        throw new APIError(404, "User Not Found, Invalid Token")
    }

    req.user = user
    next()
})

export { verifyJwt }