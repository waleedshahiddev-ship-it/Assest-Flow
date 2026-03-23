export const employerOnboardingForm = {
    submitLabel: "Create Account and Company",
    fields: [
        {name: "clerkId", label: "Clerk ID", type: "text"},
        {name: "email", label: "Email", type: "email"},
        {name: "fullName", label: "Full Name", type: "text"},
        {name: "role", label: "Role", type: "text"},
        {name: "companyName", label: "Company Name", type: "text"},
        {name: "industryType", label: "Industry Type", type: "text"},
        {name: "companySize", label: "Company Size", type: "text"},
        {name: "website", label: "Company Website", type: "url"},
        {name: "location", label: "Company Location", type: "text"},
        {name: "phone", label: "Contact", type: "text"},
    ]
}



export const formConfigs = {
    employer: employerOnboardingForm,
}


