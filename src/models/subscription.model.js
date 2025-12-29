import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    // one who is subscribing
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    // one to whom the "subscriber" is subscribing
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

export const subcription = mongoose.model("Subscription", subscriptionSchema)