import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"

const app = express()

//this is used for CORS Allowed
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//this middleware is used to decode the url
app.use(express.urlencoded({
    limit: "16kb"
}))

//this middleware is used to store public assets
app.use(express.static("public"))

//this middleware is used for JSON parsing request
app.use(express.json({
    limit: "50kb"
}))

app.use(cookieparser())

// route import
import userRouter from "./routes/user.route.js"


//route declaration
app.use("/api/v1/users", userRouter)

export { app }