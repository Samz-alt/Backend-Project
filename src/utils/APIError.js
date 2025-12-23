// APIError extends Error
// When APIError is instantiated, the Error constructor runs first
// Error’s internal properties (message, stack, name) are created
// Your constructor adds additional properties (statusCode, error, data)
// The final object contains both Error features + your custom fields

class APIError extends Error {
    constructor(statusCode, message = "Something went wrong", error = [], stack) {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.error = error
        this.data = null
        if (stack) {
            this.stack = stack
        } else {
            error.captureStackTrace(this,this.constructor)
        }
    }
}

export { APIError }