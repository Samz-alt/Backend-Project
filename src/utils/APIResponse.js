class APIResponse {
    constructor(statusCode, message = "Something went wrong", data) {
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.successCode = statusCode < 400
    }
}

export { APIResponse }