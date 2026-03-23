
import { useParams, useNavigate } from "react-router-dom";
import { createUserAndCompany } from "../services/apiOnboarding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from '@clerk/react'
const Onboarding = () => {
    const { user, isLoaded } = useUser()
    const { role } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (payload) => {
            return await createUserAndCompany(payload);
        },
        onSuccess: () => {
            // invalidate any queries that need refresh (example)
            queryClient.invalidateQueries({ queryKey: ["onboarding"] });
            // navigate after success
            navigate("/");
        },
        onError: (err) => {
            console.error("Onboarding error:", err);
        },
    });

    // For simplicity, using dummy data. Replace with a real form.
    const handleOnboardingSubmit = async () => {
        // Only proceed if user is loaded
        if (!isLoaded || !user) {
            console.error("User not loaded yet");
            return;
        }

        const payload = {
            clerkId: user.id,
            email:
                user.emailAddresses?.[0]?.emailAddress || "john.doe@example.com",
            role: role || "employer",
            fullName: user.fullName || "John Doe",
            companyName: "Clerk",
            industry: "Technology",
            companySize: "1-10",
            website: "https://acme-corp.com",
        };

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

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mt-10">
                Onboarding {role}
            </h1>

            {mutation.isError && (
                <p style={{ color: "red" }}>{mutation.error?.message}</p>
            )}

            <div className="flex justify-center mt-6">
                <button
                    onClick={handleOnboardingSubmit}
                    disabled={mutation.isPending}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50  cursor-pointer disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? "Setting up…" : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;