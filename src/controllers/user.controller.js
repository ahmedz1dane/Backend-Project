import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResposnse.js'
import { JsonWebTokenError } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'



// WHAT IS THE PURPOSE OF ACCESSTOKENS:
// SUPOSE WE ARE GONNA ACCESS SOME IMPORT DATA
// FROM THE SERVER. IN SUCH CASE INSTEAD OF 
// INCLUDING THE USERNAME AND PASSWORD EACH TIME
// IT IS CONVINIENT TO USE THESE TOKENS, FOR BETTER
// SECURITY BECAUSE THESE TOKENS WILL BE REFRESHED.

// HOW THIS ACCESTOKEN IS USED BY CLIENT FOR THE 
// ABOVE MENTIONED PURPOSE ?

// WE CAN SEE IN THE END OF THE LOGIN FUNCTION WE 
// ARE CREATING A COOKIE WHICH WE WILL SEND TO THE 
// CLIENT AS RESPONSE. THIS COOKIE WILL BE STORED IN
// THE BROWSER OF THE CLIENT. AND WHENEVER A REQUEST 
// IS MADE FROM THE CLIENT , THE BROWSER AUTOMATICALLY
// ADDS THESE ACCESSTOKEN AS HEADER






// we are using accessToken and Refresh token frequently
// so we are gonna use a function for it as below:

const generateAccessAndRefreshTokens = async(userId) => {
    // DOUBT: from where we got UserId:
    // ANS: by going below we can see that we had 
    //      retrieved the particular document from 
    //      from the mongoDB by using findOne
    //      from that we will be able to retrieve 
    //      the userId very easily 
    try {
         const user = await User.findById(userId)

         const accessToken = user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()

         user.refreshToken = refreshToken
        // DOUBT: why saved is used ?
        // ANS:

        // it is used for the purpose of updating the 
        // data in the database
         await user.save({validateBeforeSave: false})
        // when we are updating the data in the databese
        // it automatically validate the document that 
        // we have updated with the schema of that particular
        // document
        // validateBeforeSave is set to false because
        // we doesnt want to perform that
        
        // DOUBT: why this paricular condition is used here ?
        // CHECK THIS!!!!
        

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")

    }
}




const registerUser = asyncHandler( async (req, res) => {
    // ALGORITHM:
    
    //get user details from frontend
    // validation - like checking any field empty or not
    // check if user already exist: username,email
    // check for images, check for avtar
    // upload them to cloudinary, check for avtar
    // create user object (cause in mongoDB is nosql) - create entry in db
    
    // DOUBT 1: look what is happening
    // remove password and refresh token field from response

    // check for user creaation 
    // if created , return response otherwise return error



    // data from form and json are available in req.body
    // STEP1:
    const {fullName, email, username, password} = req.body
    // console.log("email", email)

    // STEP2:
    if(
        [fullName, email, username, password]
        .some((field) => 
            // DOUBT: Why some is used in the above?
            // ANS: some is used to check , wheter
            //      any of the elements in the list 
            //      satisfies the condition

            field?.trim() === ""
            // DOUBT: why ?. is used ?
            // ANS: it is used to avoid the error 
            //      that may arise when we are 
            //      applying function like trim() ect
            //      on the undefined feilds
        )
    ){
        throw new ApiError(400, "All fields are reqired")
    }

    // Checking whether the user already exist or not

    // STEP3:


    // WARNING: 
    // whenever we are communcating with database
    // which is in other continent we need to use
    // await , otherwise error will be thrown

    const existedUser =await User.findOne({
        // here in the above User is the model, that 
        // can be used to access the database and 
        // check whether the values are there or not
        // in the databases
        $or: [{ email } , { username }]
        // here $or is used cause we are checking 
        // if one of the specidied feilds is there in
        // the database or not 
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }


    // STEP4:

    console.log(req.files);
    // by using multer we are taking the images sent 
    // from the client and storing them in loaclfolder
    // in the server
    // Then we are taking the location of that place as
    // follows:
    const avatarLocalPath = req.files?.avatar[0]?.path
    // since we are using multer, it will give us the 
    // files object, in that we aill access the avatar
    // avatar is an array and we access the firrst 
    // element of the avatar , and from that we will 
    // access the local path


    // the below code is showing some error when we 
    // doesnt give coverImage in POST:
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    // To solve the error that is mentioned above
    // we can do as follows:

    let coverImageLocalPath
    if( req.files && Array.isArray(req.files.coverImage) 
    && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // in the following we are checking whether 
    // the image is in the local file or not
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }


    // STEP5:

    // Below we can see that, we are uploadinf 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // avatar is a required feild so we check again
    // whether it is uploaded or not in the cloudinary
    // as follows:

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")

    }


    // STEP6:


    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        // DOUBT: why we are using here ?. and not in 
        //        case of avatar
        // ANS: cause by checking the previous written
        //      code we can see that , in casee of avatar
        //      we are checking for its existence more
        //      than one time since its compulsury field
        //      but in case of coverImage we are not 
        //      doing so . Therefore we need to check
        //      that , inorder not to produce any error
        email,
        password,
        username: username.toLowerCase()
    })
    
    // STEP7:

    // we are gonna remove refreshToken and password
    // feild from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
        // here we are using select to remove those
        // specified feilds (thats why we are using
        // the -(minus) sign)
    )


    // STEP8:
    
    // Checking the creation of the object
    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    // this is the rason why we have removed password
    // and refreshToken (that is for sending response)
    return res.status(201).json(
        new ApiResponse(200, createdUser, 
            "User registered Successfully")
    )
    // DOUBT 1 : why 2 status code is used in the 
    //           above case ?
    // ANS: When you are using the postman , you can understand 
    //      this, cause in this 2 status code , one will be shown 
    //      in the title bar and the other will be shown in the
    //      json body
})

const loginUser = asyncHandler( async (req, res) => {
    // data <- req body
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies


    const {email , username, password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or password is required")
        // DOUBT: Why new is used ?
        // ANS: Cause we are creating
        //      the object of ApiError
    }


    const user = await User.findOne({
        $or:[{username} , {email}]
    }) 
    // DOUBT: see what user is 

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // DOUBT:Why user instead of User ?
    // ANS:

    // in the below we can see a situation  , we are 
    // using (u)ser instead of (U)ser because User 
    // is an instance of mongoose , whereas user 
    // is ours , that we have retrieved from the mongoDB
    // findOne etc are the methods of mongoose , so
    // we will be using User with it (cause its the 
    // instance of mongoose itself). Whereas 
    // isPasswordCreate is method that we had created
    // so we has to use the user that is ours instedof
    // that of mongoose (User)
    const isPasswordValid = await user.isPasswordCorrect(password)


    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credential")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshTokens(user._id)

    // Now we are gonna create cookies and sent it
    // to user
    // DOUBT: Why cant we use the user object jst above?
    // ANS:

    // Cause in jst above we can see that we are 
    // updating our database with refreshToken
    // but that is not available in the user Object
    // cause we have created it before we are updating
    // the database . Therefore it doesnt contains the 
    // updated data. So that is  the reason behind we 
    // are creating loggedInUser

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        // means that , this particular cookie can 
        // be accessed only by using http . Which 
        // enhanses the security
        secure:true
    }

    return res
    .status(200)

    .cookie("accessToken", accessToken, options)
    // here the name of the cookie is accessToken
    // then we pass the data and the options

    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, 
                refreshToken
            },
            "User logged in Successfully"
        )
    )
})


const logoutUser = asyncHandler( async (req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
            // specifies whether to return the original
            // or the updated ducument. Here sice we 
            // specifies true, the updated document is 
            // returned
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})



// WORKING OF BELOW CODE:
// the access token will expire after its specified
// expiration time , then we have to refresh it 
// using the refresh token . That is what we are
// doing below:
// There we can see that we are taking the refresh 
// token from the client and then checking it 
// whether it is as same as that in the database
// after that new access and refresh tokens are made
// and then send them as response to the client
const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefreshToken = req.cookies
    .refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshTocken){
            throw new ApiError(401, 
                "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken : newrefreshToken
                },
                "AccessToken refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "invalid refreshToken ")
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} 