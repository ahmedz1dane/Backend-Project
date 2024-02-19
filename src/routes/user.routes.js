import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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

export default router