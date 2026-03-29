import { userSchema } from "./shared";
import { z } from "zod"

const adminOnbaordingSchema = userSchema.extend({
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be at most 15 digits'),
    title: z.string().min(5, "Title must be of at least 5 characters")
})

export default adminOnbaordingSchema