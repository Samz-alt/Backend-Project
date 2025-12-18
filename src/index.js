import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"
import mongoose from "mongoose"


dotenv.config(
    {
        path: "./env"
    }
)

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000
        
        mongoose.connection.on("error", () => {    //this part of code is for connection error to the database.
            console.error(`DB NOT CONNECTED`);     
        })

        app.listen(PORT, () => {
            console.log(`Server is running at PORT: ${PORT}`)
        })

    })
    .catch((error) => {
        console.log(`DB CONNECTION FAILED: ${error}`);
    })










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