import { Router } from "express";
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(

    upload.fields([
        // DOUBT: why upload.feild is used ?
        // ANS: suppose the form send by the client 
        // contain more than one file such as avatar
        // , coverImage . And suppose that , each of 
        // thesefile comes from 2 different feilds in the 
        // form . In such a situation we use upload.fields
        // to handle them 
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
        
    ]),
    registerUser
    )


router.route("/login").post(loginUser)

// secure routes:
// which means these are only available when the user
// is logged in , so we will add the verifyJWT to do so
// as follows:

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
// DOUBT: Why get is used ?
// ANS:

router.route("/update-account").patch(verifyJWT,updateAccountDetails)
// DOUBT: Why patch is used ?
// ANS:

router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
// DOUBT: Why verifyJWT is given first ?
// ANS:

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router