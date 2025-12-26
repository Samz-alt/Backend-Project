class APIResponse {
    constructor(statusCode, data, message = "Something went wrong") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.successCode = statusCode < 400
    }
}

export { APIResponse }