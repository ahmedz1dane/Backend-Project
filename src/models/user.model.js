import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true  
            // Searching field will be enabled to 
            // search username. I think so
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, 
            // URL of cloudinary cause we have already 
            // said that in MongoDB we wont save images
            // or videos ,rather we save them in a third
            // party service like cloudinary and then
            // we will saave that particular URL in our
            // MongoDB  
            required:true
        },
        coverImage:{
            type:String, // Cloudinary link

        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true, 'Password is required']
        },
        refreshToken:{
            type:String
        }
    },{
        timestamps:true
    }
    )

// WORKING OF THE FOLLOWING CODE:
// here pre is the middleware which is used to do
// some task on the data in the model . Here in this 
// case we can see that we have used the event "save" 
// which means we are gonna do something on the 
// specified data in the model before it is gonna 
// be saved in the database .
// Here in this case we can see that we are using the
// bcrypt to hash the password

userSchema.pre("save", async function (next) {

    // DOUBT: Why cant we use arrow function () => {} here ?
    // ANS: Cause we can see that we are using this 
    //      keyword below

    if(!this.isModified("password")) return next();
        this.password = bcrypt.hash(this.password, 10)
        next()

        // DOUBT:WHy there is a need to use next() ?
        // ANS: It is necessary to signal the 
        //      execution of the next middleware or 
        //      in this case the saving of the data to
        //      the database . If we doesnt use that 
        //      it may cause some problems
    
})


// WORKING OF THE BELOW CODE:
// its actually used to compare the password that 
// is stored in the database with some plain 
// password (as we can see it an instance method for 
// the model)

userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            usename: this.usename,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFERSH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)