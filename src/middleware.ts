import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header missing" });
        } else {
            const decoded = jwt.verify(authHeader as string, typeof process.env.JWT_SECRET) as JwtPayload;
            req.userId = decoded.userId;
            next()
        }
    }catch(err){
        console.error('Authentication error:', err);
        return res.status(401).json({ error: "Invalid token" });
    }
}