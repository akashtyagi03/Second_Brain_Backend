import mongoose, { Schema, model } from "mongoose"; 

const userschema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const contenttype = ["Document", "tweet", "youtube", "link", "image", "video"]
const contentschema = new Schema({
    title : {type:String, require:true},
    link: {type:String, require:true},
    // enum retrict the value of the field , so that user can only select contenttype option
    types: {type:String, enum:contenttype, require:true},
    userId : {type: mongoose.Types.ObjectId, ref: "User", required: true},
});

const linkschema = new Schema({
    hash: String,
    user_Id : {type: mongoose.Types.ObjectId, ref: "User", required: true},
})

export const sharedlinks = model("sharedlinks", linkschema);
export const User = model("User", userschema);
export const Content = model("Content", contentschema); 