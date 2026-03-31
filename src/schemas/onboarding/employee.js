import { userSchema } from "./shared";
import { z } from "zod";

const employeeOnboardingSchema = userSchema.extend({
    companyId: z.string().min(1, "Company is required"),
    companyName: z.string().min(1, "Company name is required"),
    department: z.string().min(1, "Department is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    location: z.string().min(1, "Location is required"),
    token: z.string().min(1, "Invite token is required"),
});

export default employeeOnboardingSchema;
