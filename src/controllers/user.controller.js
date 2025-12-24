import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // get response from the frontend
    // check validation- if required fields are empty, email format validation
    // check user is already created using email & username
    // check for images after uploading it in the local server, specially avatar as it is required.
    // upload image files in Cloudinary
    // check if the image files are uploaded in cloudinary
    // create a user object and upload it in the DB
    // check if the user has been created
    // remove the password and the refreshToken from response
    // return response

    const { username, email, fullName, password } = req.body
    console.log(`username: ${username}, email: ${email}, fullName: ${fullName}, password: ${password}`);


    if ([username, email, fullName, password].some((field) => (field.trim() === ""))) {
        throw new APIError(400, "Required fields are empty")
    }

    if (!email.includes("@")) {
        throw new APIError(400, "@ is missing")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]    //$or is used for finding a User in DB with any of the field mentioned in the array and this is for checking both at once
    })

    if (existedUser) {
        throw new APIError(409, "User with email or username already exists")
    }

    //this req is passed throughout and after adding the file to the local server multer attaches more options in req other than what is provided by express.
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path  //optional chaining is for safety reasons
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path  //optional chaining is for safety reasons

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required")
    }

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath)
    const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatarUpload);

    if (!avatarUpload.url) {
        throw new APIError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName: fullName,
        email: email,
        username: username.toLowerCase(),
        avatar: avatarUpload.url,
        password: password,
        coverImage: coverImageUpload?.url || ""
    })
    console.log(user)


    const userCreated = await User.findById(user._id).select("-password -refreshToken") //this select is used to deselect the field and the db doesn't share that field's value.
    console.log(userCreated)


    if (!userCreated) {
        throw new APIError(500, "User Not Registered")
    }

    //this is for returning 
    return res.status(201).json(
        new APIResponse(200, "User Created Successfully", userCreated)
    )



})

export { registerUser }