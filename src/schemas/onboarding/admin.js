import { userSchema } from "./shared";
import { z } from "zod"

const adminOnbaordingSchema = userSchema.extend({
    companyId: z.string(),
    token: z.string().min(1, "Invite token is required"),
    companyName: z.string().optional(),
    companyLocation: z.string().optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be at most 15 digits'),
    title: z.string().min(5, "Title must be of at least 5 characters")
})

export default adminOnbaordingSchema