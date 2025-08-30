import mongoose, { Schema, model } from "mongoose";

const userschema = new Schema({
    username : {type:String, unique:true},
    password : String
});

export const User = model("User", userschema);