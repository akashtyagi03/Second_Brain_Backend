require('dotenv').config();     
import express from "express";
import type {Express, Request, Response } from "express";
import { contentSchema, UserSchema } from "./zod";
import { Content, sharedlinks, User } from "./db";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware";
import { generateHash } from "./utils";
import cors from "cors";
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());

// signup End point
app.post("/api/v1/signup", async(req: Request, res: Response) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   

    try{
        const hashedpassword = await bcrypt.hash(password, 5);
        await User.create({ username, password: hashedpassword });
    }catch(error){
        console.error('Error creating user:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
    res.json({
        message: "User created successfully"
    })
}); 

// signin End point
app.post("/api/v1/signin", async(req: Request, res: Response    ) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   
    try{
        type usertype = {
            _id: string,
            username: string,
            password: string
        } | null;
        const user: usertype = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({userId: user._id}, typeof process.env.JWT_SECRET);
        res.json({
            message: "User signin successfully",
            token
        })
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// create content End point
app.post("/api/v1/content", authMiddleware, async(req: Request, res: Response) => {
    // body must have link, title
    const { link, title, types } = req.body;
    const validate = contentSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }
    
    try{
        // @ts-ignore
        await Content.create({ link, title, types, userId: req.userId});
        res.json({ message: "Content created successfully" });
    }catch(error){
        console.error('Error creating content:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}); 

// to get back all content End point 
app.get("/api/v1/content", authMiddleware, async(req: Request, res: Response) => {
    // @ts-ignore
    const user_Id = req.userId
    try{
        const contents = await Content.find({ userId: user_Id });
        res.json({ contents });
    }catch(error){
        console.error('Error fetching contents:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}); 

// delete any content End point
app.delete("/api/v1/content", authMiddleware, async(req: Request, res: Response) => {
    // @ts-ignore
    const user_Id = req.userId
    const { contentId } = req.body
    try{
        const contents = await Content.findOneAndDelete({ userId: user_Id, _id: contentId });
        res.json({ massage: "Content deleted successfully", contents });
    }catch(error){
        console.error('Error fetching contents:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}); 

// shared link of brain End point
app.get("/api/v1/brain/share", authMiddleware, async(req: Request, res: Response) => {
    const share = req.query.share;
    if (share){
        const hash = generateHash(10);
        //@ts-ignore
        await sharedlinks.create({ hash, user_Id: req.userId });
        res.json({
            massage: "Link created successfully",
            hash
        })
    } else {
        await sharedlinks.deleteOne({
            //@ts-ignore
            user_Id: req.userId
        })
        res.json({
            massage: "Link deleted successfully",
        })
    }
});

// get other brain content via shared link End point
// here we don't need authMiddleware because anyone can access the shared link
app.get("/api/v1/brain/:shareLink", async(req: Request, res: Response) => {
    const hash = req.params.shareLink;

    await sharedlinks.findOne({ hash }).then( async(link) => {
        if (!link) {
            return res.status(404).json({ error: "Link not found" });
        }
        const contents = await Content.find({ userId: link.user_Id });
        res.json({ contents });
    }).catch((error) => {
        console.error('Error fetching shared link:', error);
        return res.status(500).json({ error: "Internal server error" });
    })
}); 

async function main(){
    if (process.env.MONGODB_URL === undefined) {
        throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(process.env.MONGODB_URL!);
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

main()