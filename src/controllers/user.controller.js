import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResposnse.js'

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
            // DOUBT: Why some is used 
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
})



export {registerUser} 