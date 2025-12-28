import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

export const subcription = mongoose.model("Subscription", subscriptionSchema)