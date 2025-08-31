import express from "express";
import type {Express, Request, Response } from "express";
import { UserSchema } from "./zod.js";
import { User } from "./db.js";
import jwt  from "jsonwebtoken";
//@ts-ignore
import { JWT_SECRET } from "./config";
import bcrypt from "bcrypt";

const app: Express = express();
app.use(express.json());

app.post("/api/v1/signup", async(req: Request, res: Response) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   

    try{
        const hashedpassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedpassword });
    }catch(error){
        return res.status(500).json({ error: "Internal server error" });
    }
    res.json({
        message: "User created successfully"
    })
}); 

app.post("/api/v1/signin", async(req, res) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   
    try{
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const token = jwt.sign({userId: user._id}, JWT_SECRET);
        res.json({
            message: "User signin successfully",
            token
        })
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("api/v1/signup", async(req, res) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   

    await User.create({ username, password });
    res.json({
        message: "User created successfully"
    })
}); 
app.post("api/v1/signup", async(req, res) => {
    const { username, password } = req.body;
    const validate = UserSchema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }   

    await User.create({ username, password });
    res.json({
        message: "User created successfully"
    })
}); 

    