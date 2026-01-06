import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        reqruired: true,
    },
    image: [{
        type: String
    }],
    imagePublicId: [{
        type: String
    }]
}, { timestamps: true })

export const Tweet = mongoose.model("Tweet", tweetSchema)