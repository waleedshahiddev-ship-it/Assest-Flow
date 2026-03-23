import { userSchema, companySchema } from "./shared";
import { z } from "zod";

const employerOnboardingSchema = userSchema.merge(companySchema).extend({
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be at most 15 digits'),
})



export default employerOnboardingSchema


