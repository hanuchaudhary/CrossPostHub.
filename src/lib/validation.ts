import z from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
});

export const signinSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
});