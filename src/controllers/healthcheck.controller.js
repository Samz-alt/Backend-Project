import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {
                    status: 'OK'
                },
                "This endpoint is working fine"
            )
        )

})


export { healthcheck }