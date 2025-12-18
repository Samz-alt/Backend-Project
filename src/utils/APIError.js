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
            error.captureStackTrako
        }
    }
}

export { APIError }