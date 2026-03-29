import { HideImageRounded } from "@mui/icons-material"


export const employerOnboardingForm = {
    title: "Employer Onboarding",
    description: "Please fill out the form below to create your account and company profile.",
    submitLabel: "Create Account and Company",
    fields: [
        { name: "clerkId", label: "Clerk ID", type: "text", readOnly: true, hidden: true },
        { name: "email", label: "Email", type: "email", readOnly: true },
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "role", label: "Role", type: "text", readOnly: true },
        { name: "companyName", label: "Company Name", type: "text" },
        { name: "industry", label: "Industry", type: "text" },
        { name: "companySize", label: "Company Size", type: "text" },
        { name: "website", label: "Company Website", type: "url" },
        { name: "location", label: "Company Location", type: "text" },
        { name: "phone", label: "Contact", type: "text" },
    ]
}

export const adminOnboardingForm = {
    title: "Admin Onboarding",
    description: "Confirm your profile details to continue.",
    submitLabel: "Continue",
    fields: [
        { name: "clerkId", label: "Clerk ID", type: "text", readOnly: true, hidden: true },
        { name: "email", label: "Email", type: "email", readOnly: true },
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "role", label: "Role", type: "text", readOnly: true },
        { name: "companyName", label: "Company Name", type: "text", readOnly: true },
        { name: "companyLocation", label: "Company Location", type: "text", readOnly: true },
        { name: "phone", label: "Phone", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "token", label: "Invite Token", type: "text", readOnly: true, hidden: true },
    ],
}

export const managerOnboardingForm = {
    title: "Manager Onboarding",
    description: "Confirm your profile details to continue.",
    submitLabel: "Continue",
    fields: [
        { name: "clerkId", label: "Clerk ID", type: "text", readOnly: true },
        { name: "email", label: "Email", type: "email" },
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "role", label: "Role", type: "text", readOnly: true },
        { name: "token", label: "Invite Token", type: "text", readOnly: true },
    ],
}

export const employeeOnboardingForm = {
    title: "Employee Onboarding",
    description: "Confirm your profile details to continue.",
    submitLabel: "Continue",
    fields: [
        { name: "clerkId", label: "Clerk ID", type: "text", readOnly: true },
        { name: "email", label: "Email", type: "email" },
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "role", label: "Role", type: "text", readOnly: true },
        { name: "token", label: "Invite Token", type: "text", readOnly: true },
    ],
}


export const formConfigs = {
    employer: employerOnboardingForm,
    admin: adminOnboardingForm,
    manager: managerOnboardingForm,
    employee: employeeOnboardingForm,
}


