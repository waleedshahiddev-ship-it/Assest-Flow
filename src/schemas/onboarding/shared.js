import { z } from "zod";


export const userSchema = z.object({
    clerkId: z.string(),
    email: z.string().email('Invalid email'),
    fullName: z.string().min(1, 'Full name required'),
    role: z.enum(["employer", "admin", "manager", "employee"]),
})


export const companySchema = z.object({
    companyName: z.string().min(1, 'Company name required'),
    industry: z.string().min(1, 'Industry required'),
    companySize: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    location: z.string().min(1, 'Location is required'),
})

