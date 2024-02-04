// require('dotenv').config({path: './env'})
// the above line of code which we got from 
// the npm website is the require form , we need 
// to change that into import form
// it is done as follows: 

import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env' 
    // DOUBT: it should be like '../.env'

})


connectDB()

































/*
import express from "express";
const app = express()

;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/
        ${DB_NAME}`)
        // in the above line we can see tha twe have 
        // connected the mongoose to the mongoDB using
        // MONGODB_URI from .env file and the database 
        // name that is stored in the constants file

        // after the connecting we can see the listeners
        // which are part of the express as , 

        app.on("error" , (error) => { // DOUBT 1 : why 3 r
            console.log("ERRR: " , error);
            throw error
        })
        // DOUBT 2 : why there is a need to handle
        //           the error here cause , it is already
        //           handled in the catch section
        // ANS: I THINK
        //      app.on is used to handle the error that is
        //      occured in the express application itseelf
        //      whereas , if database connection fails , it
        //      is handled in catch block

        app.listen(process.env.PORT, () =>{
            console.log(`App i listening on ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error: ",error)
        throw error // DOUBT 3 : I think its error istead of the typo err
    }
})()
// DOUBT 4 : why this second parenthesis is used ?
// ANS: This parenthesis will immediatly call the 
//      function that is returned in the jst before ()

*/
