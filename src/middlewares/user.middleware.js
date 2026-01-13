import { validationResult } from "express-validator"
import { APIError } from "../utils/APIError.js";


export const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }

    // here the results are structed in a formated Manner
    const extractedErrors = []
    errors.array().map((error) => extractedErrors.push(
        {
            [error.path]: error.msg
        }
    ))
    throw new APIError(422, "Recieved Credentials are not Valid", extractedErrors)
}