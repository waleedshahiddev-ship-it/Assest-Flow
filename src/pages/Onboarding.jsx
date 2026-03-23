
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { createUserAndCompany } from "../services/apiOnboarding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from '@clerk/react'
import { toast } from "sonner";
import { schemas } from '../schemas/onboarding'
import { formConfigs } from '../configs/onboardingForms'
import { OnboardingForm } from '../ui/OnboardingForm'

const ALLOWED_ROLES = ["employer", "admin", "manager", "employee"]

const Onboarding = () => {
    const { user, isLoaded, isSignedIn } = useUser()
    const { role } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const normalizedRole = ALLOWED_ROLES.includes(role) ? role : "employer"

    const roleSchema = schemas[normalizedRole]
    const uiConfig = formConfigs[normalizedRole]

    // based on the role decide the default values 

    const defaultValues = {
        clerkId: user?.id || "",
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        fullName: user?.fullName || "",
        role: normalizedRole,
    }

    const mutation = useMutation({
        mutationFn: async (payload) => {
            return await createUserAndCompany(payload);
        },
        onSuccess: () => {
            // invalidate any queries that need refresh (example)
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
            // navigate after success
            navigate("/");
        },
        onError: (err) => {
            console.error("Onboarding error:", err);
        },
    });

    const handleSubmit = async (values) => {
        // Only proceed if user is loaded
        if (!isLoaded || !user) {
            console.error("User not loaded yet");
            return;
        }

        const payload = {
            ...values,
            clerkId: user.id,
            email: values.email || user.emailAddresses?.[0]?.emailAddress || "",
            fullName: values.fullName || user.fullName || "",
            role: normalizedRole,
        }

        toast("You submitted the following values:", {
            description: (
                <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
                    <code>{JSON.stringify(payload, null, 2)}</code>
                </pre>
            ),
            position: "bottom-right",
            classNames: {
                content: "flex flex-col gap-2",
            },
            style: {
                "--border-radius": "calc(var(--radius)  + 4px)",
            },
        })

        mutation.mutate(payload);
    };

    // Show loading message while Clerk loads the user
    if (!isLoaded) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-center mt-10">
                    Loading…
                </h1>
            </div>
        );
    }

    if (!isSignedIn) {
        return <Navigate to="/login" replace />
    }

    if (!roleSchema || !uiConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
                Unsupported onboarding role. Please use a valid role URL.
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <OnboardingForm
                schema={roleSchema}
                uiConfig={uiConfig}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={mutation.isPending}
            />

            {mutation.isError && (
                <p className="mt-4 text-sm text-red-600">{mutation.error?.message || "Onboarding failed"}</p>
            )}
        </div>
    );
};

export default Onboarding;