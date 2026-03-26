
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { createUserAndCompany } from "../services/apiOnboarding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from '@clerk/react'
import { toast } from "sonner";
import { schemas } from '../schemas/onboarding'
import { formConfigs } from '../configs/onboardingForms'
import { OnboardingForm } from '../ui/OnboardingForm'
import { checkOnboardingStatus } from "../services/apiOnboarding";
import { useQuery } from "@tanstack/react-query"
import { Typography } from "@mui/material";



const ALLOWED_ROLES = ["employer", "admin", "manager", "employee"]

const Onboarding = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { role } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const normalizedRole = (role || "").toLowerCase();
    const roleSchema = schemas[normalizedRole];
    const uiConfig = formConfigs[normalizedRole];

    const { data: onboarding, isLoading: onboardingLoading, isError: onboardingError } = useQuery({
        queryKey: ["onboardingStatus", userId],
        queryFn: () => checkOnboardingStatus(userId),
        enabled: isLoaded && isSignedIn && !!userId,
    });

    const mutation = useMutation({
        mutationFn: async (payload) => createUserAndCompany(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
            navigate("/");
        },
        onError: (err) => {
            console.error("Onboarding error:", err);
        },
    });

    const defaultValues = {
        clerkId: user?.id || "",
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        fullName: user?.fullName || "",
        role: normalizedRole,
        companyName: "",
        industry: "",
        companySize: "",
        website: "",
        location: "",
        phone: "",
    };

    const handleSubmit = async (values) => {
        if (!isLoaded || !user) {
            console.error("User not loaded yet");
            return;
        }

        toast("You submitted the following values:", {
            description: (
                <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
                    <code>{JSON.stringify(values, null, 2)}</code>
                </pre>
            ),
            position: "bottom-right",
            classNames: {
                content: "flex flex-col gap-2",
            },
            style: {
                "--border-radius": "calc(var(--radius)  + 4px)",
            },
        });

        mutation.mutate(values);
    };




    if (onboardingError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
                <Typography variant="h6" color="error">
                    Error occurred while checking onboarding status.
                </Typography>
            </div>
        );
    }

    if (onboardingLoading && onboarding?.onboarding) {
        return <Navigate to="/" replace />;
    }


    if (!ALLOWED_ROLES.includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
                Unsupported onboarding role. Please use a valid role URL.
            </div>
        );
    }

    if (!roleSchema || !uiConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
                <Typography variant="h6" color="error">
                    Configuration missing for role: {role}
                </Typography>
            </div>
        );
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