import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";

const router = Router()

router.route("/channel/:channelId").post(verifyJwt, toggleSubscription)
router.route("/subscribersList/:channelId").get(verifyJwt, getUserChannelSubscribers)
router.route("/subscribedList/:subscriberId").get(verifyJwt, getSubscribedChannels)
export default router