const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        return await requestHandler(req, res, next)  //here the variable that stores the function reference has been called and executed with the params coming from the express.
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { asyncHandler }