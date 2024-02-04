import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n MongoDB connected !! DB HOST:
        ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error",error)
        process.exit(1)
        // here the above line will terminate Node.js
        // here we can see that we have given the 
        // parameter 1 . Which means that , the process
        // will be exited when error or abnormal situation 
        // occurs
        
        // DOUBT: why throw is not used intead of the 
        //        above given line of code ?
        // ANS: process.exit(1) is used to forcefully 
        //      terminate the Node.js process.
        //      This approach is more abrupt and doesn't 
        //      provide an opportunity for the calling 
        //      code to handle the error

        //      whereas in case of throw keyword
        //      if we use it inside the try block
        //      that error will be thrown and caught by
        //      the catch block
        //      suppose if we use the throw keyword in the
        //      catch block , here we can see that , the 
        //      same or the modified error is thrown. This 
        //      new erro will be caught at a higher level
        //      , allowing you to handle errors at different
        //       levels of your application.
    }
}

export default connectDB