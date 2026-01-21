import mongoose from "mongoose";
import jwt from "jsonwebtoken"


const userOAuthSchema = new mongoose.Schema({
    authProvider: {
        type: String,
        required: true,
        lowercase: true,
    },
    providerId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })



userOAuthSchema.methods.generateAccessTokenAuth = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userOAuthSchema.methods.generateRefreshTokenAuth = function () {
    return jwt.sign(
        {
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const UserOAuth = mongoose.model("UserOAuth", userOAuthSchema)