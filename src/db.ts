import mongoose, { Schema, model } from "mongoose"; 

const userschema = new Schema({
    username : {type:String, unique:true},
    password : String
});

const contentschema = new Schema({
    // type : {type:String, enum:["document", "tweet", "youtube", "link"]},
    title : String,
    link: String,
    tag: [{types: mongoose.Types.ObjectId}],
    userId : {type: mongoose.Types.ObjectId, ref: "User", required: true},
});

const linkschema = new Schema({
    hash: String,
    user_Id : {type: mongoose.Types.ObjectId, ref: "User", required: true},
})

export const sharedlinks = model("sharedlinks", linkschema);
export const User = model("User", userschema);
export const Content = model("Content", contentschema); 