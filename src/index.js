import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config(
    {
        path: "./env"
    }
)

connectDB()











/*
Not using this code because this is a non-reusable code

import mongoose from "mongoose"
import { DB_Name } from "./constants.js"
import express from "express"
const app = express()

    (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
            app.on("error", (error) => {
                console.log("DB no connected", error)
            })

            app.listen(process.env.PORT, () => {
                console.log("Server is running at:", process.env.PORT)
            })
        }
        catch (error) {
            console.log("Connection Error:", error);
            throw error
        }
    })()
*/