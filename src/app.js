import express  from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express()
// DOUBT 1: is it necessary to give the name as app itself
// ANS: No , here it is given like this cause usually
//      it is done like that


// DOUBT 2: WHAT IS MEANT BY MIDDLEWARE
// ANS: middleware are used to process the request
//      from the client ,response to the client etc.
// so in general we can say that , middlewares are
// the functions  that are present in the middle
// and do some specific functions

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
// Working: parse the json data in the incoming 
//          request and set the limit to 16kb

app.use(express.urlencoded({extended:true,
limit:"16kb"
}))
// Working: Suppose the data in the incoming HTTP
//          request is of the form url encoded like
//          data: name=John%20Doe&age=25`
//          then this is need to be parsed , which is 
//          done here

app.use(express.static("public"))
// here , public is a folder which contains data like
// images

app.use(cookieParser())
// Working: when a client makes a request , it can 
//          include cookies in the request headers
//          this middleware will parese that and give 
//          a object that contain key-value pair of
//          parsed cookies



// Routes import

// they are usually kept in app.js but not in index.js
// cause index.js are usually kept more clean

import userRouter from './routes/user.routes.js'


// Routes declaration

app.use("/api/v1/users", userRouter)

export { app }