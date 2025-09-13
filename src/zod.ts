import z from 'zod';

export const UserSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6)
});

export const contentSchema = z.object({
    // type: z.enum(["document", "tweet", "youtube", "link"]),
    link: z.string(),
    title: z.string().min(1).max(100),
    types: z.string(),
});