import mongoose, {Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema(
    {
        videoFile:{
            type:String, // Cloudinary URL 
            required:true
        },
        thumbnail:{
            type:String, //Cloudinary URL
            required:true
        },
        title:{
            type:String, 
            required:true
        },
        thumbnail:{
            type:String, 
            required:true
        },
        description:{
            type:String, 
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }



    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)
// usually mongoose is used to query the database to 
// retrieve data . Mongoose provide paginate() for 
// std queries but it doesn't support pagination for 
// more complex aggregation queries
// thats why we use mongooseAggregatePaginate
// When applied to a Mongoose schema, it adds
//  pagination support for aggregation results.

export const Video = mongoose.model("Video",videoSchema)

// refer tmrw:
// https://chat.openai.com/share/174f82e6-4567-4e32-bde6-cdb400de159e