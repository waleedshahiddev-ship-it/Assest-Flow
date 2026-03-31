import { userSchema } from "./shared";
import { z } from "zod";

const managerOnboardingSchema = userSchema.extend({
    companyId: z.string().min(1, "Company is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyLocation: z.string().min(1, "Company location is required"),
    department: z.string().min(1, "Department is required"),
    managerLevel: z.string().min(1, "Manager level is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
    token: z.string().min(1, "Invite token is required"),
});

export default managerOnboardingSchema;
