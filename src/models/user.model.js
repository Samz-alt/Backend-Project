import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudnary bucket URL
        required: true
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    refreshToken: {
        type: String,
    },
    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }
}, { timestamps: true })

//middleware hook for encrypting the password before saving it to the DB
userSchema.pre("save", async function (next) {       //here "pre" is the middleware for the schema
    if (!this.isModified("password")) return //here "this" is the mongoose document....We can omit next entirely Mongoose sees that it’s an async function and waits for it to resolve.

    this.password = await bcrypt.hash(this.password, 10) //this means before saving the password encrypt it to hash

})

//assigning method in the schema for checking the password when the user sends requests for login or different purposes
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//assigning methods(prototypes OOP) in the schema for jwt tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User = mongoose.model("User", userSchema)