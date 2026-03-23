import { z } from "zod";


export const userSchema = z.object({
    clerkId: z.string(),
    email: z.string().email('Invalid email'),
    fullaName: z.string().min(1, 'Full name required'),
    role: z.enum(["employer", "admin", "manager", "employee"]),
})


export const companySchema = z.object({
    companyName: z.string().min(1, 'Company name required'),
    industryType: z.string().min(1, 'Industry type required'),
    companySize: z.string().optional(),
    website: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
})

