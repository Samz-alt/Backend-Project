import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {  //this function is written here for cleaner code
    try {
        const user = await User.findById(userId) //this is a Mongoose Document

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()


        user.refreshToken = refreshToken  //this is for updating the value in the user i.e. the document object of the MongoDB
        user.save({ validateBeforeSave: false }) //this saves the value in the MongoDB and it asks for password for modifying in DB, so this property is used for not requiring password.

        return { accessToken, refreshToken }

        // OR 
        // await User.findByIdAndUpdate(userId, { refreshToken: refreshToken }, { new: true })

    } catch (error) {
        throw new APIError(500, "Something went wrong while generating both Access and Refresh Token")
    }
}


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
        new APIResponse(200, userCreated, "User Created Successfully")
    )



})

const loginUser = asyncHandler(async (req, res) => {   //req and res both are objects so we can add new data in it via middleware 
    //req recieved from frontend
    //validate the details being send
    //check if the user is an existing user
    //check the password if its correct
    //generate access and refresh token
    //send cookie

    const { username, email, password, } = req.body

    if (!(username && email && password)) {
        throw new APIError(401, "Required Credentials Not Provided")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(404, "User Not Found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)  //this method is connected to the userSchema which is attached for each document instance and not the model.

    if (!isPasswordValid) {
        throw new APIError(404, "Password Invalid")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    /*
    here I can do 3 things based on optimization or if its necessary, 
     1. Either I send the userData from the generateAccessAndRefreshToken function after updating the MongoDB there.
     2. I can just call the database again.
    */

    const loggedInUser = await User.findById(user._id,).select("-password -refreshToken")

    //options is being send otherwise it can be read & modified by the frontend using document.cookie and it can be used for attacks.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) //cookie can be access as it is attached by the cookie-parser middleware
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(
                201,
                {
                    user: loggedInUser,
                    accessToken, //these tokens should not be send via response as it possess security risks, but if its a mobile application then it can be send for setting it in.
                    refreshToken
                },
                "User LoggedIn Successfully"
            )
        )
})

//this operation requires a secure route and for that we have to verify authentication and for that written a auth middleware. 
const logoutUser = asyncHandler(async (req, res) => {
    // get authenticated as it is a secured route via jwt
    // extract userdata from jwt after verifying the user
    // send the userdata in req
    // remove the access token from the cookie and the refresh token from the db
    // send res

    const user = req.user

    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true } //this means send the updated response
    )

    // when clearing a cookie you must provide the same options because the browser treats cookies as unique by name + options. As we have multiple cookies with the same name but different paths or domains.

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(201, {}, "User LoggedOut SuccessFully")
})

export {
    registerUser,
    loginUser,
    logoutUser
}