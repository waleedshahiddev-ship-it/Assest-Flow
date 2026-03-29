import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getCompanyDetails } from "../services/apiInvitations"
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/react'
import { useEffect } from 'react'
import { sendAdminInvite } from "../services/apiInvitations"
import { useMutation } from '@tanstack/react-query'
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import { useState } from 'react'
import { getUserDetails } from "../services/apiInvitations"

const InviteEmployer = () => {



    // get the id of the current clerk user 

    const { user, isLoaded } = useUser()

    const [userName, setUserName] = useState("")


    // query the supabase to get the company details 
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    const { data, isLoading: companyLoading, isError: companyError } = useQuery({
        queryKey: ["Company Details of the User ID ", user?.id],
        queryFn: () => getCompanyDetails(user?.id),
        enabled: isLoaded && !!user?.id
    })

    if (companyError) {
        throw new Error("Failed to fetch the company details of the current user", companyError)

    }

    // query to find the user details like user name to be used in the invitation email 

    const { data: userProfile, isLoading, isError: userProfileError } = useQuery({
        queryKey: ["User Profile details", user?.id],
        queryFn: () => getUserDetails(user?.id),
        enabled: isLoaded && !!user?.id
    })

    if (userProfileError) {
        throw new Error("Failed to fetch the user profile details", userProfileError)
    }




    useEffect(() => {
        if (!isLoading && userProfile) {
            console.log(userProfile.full_name)
            setUserName(userProfile.full_name)
        }
    }, [isLoading, userProfile])

    const defaultValues = {
        email: "",
        role: "admin",
        companyName: "",
        companyLocation: ""
    }

    const formSchema = z.object({
        email: z.string().email(),
        role: z.string(),
        companyName: z.string(),
        companyLocation: z.string()
    })


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues
    })


    const mutation = useMutation({
        mutationFn: async (payload) => sendAdminInvite(payload),
        onSuccess: async (result) => {
            try {
                if (!EMAILJS_PUBLIC_KEY) {
                    throw new Error("Missing VITE_EMAILJS_PUBLIC_KEY")
                }

                const inviteToken = result?.data?.token; // from your DB insert response
                const inviteLink = `${import.meta.env.VITE_APP_URL}/admin/invite/${inviteToken}`;


                await emailjs.send(
                    "service_bl4gzfr",
                    "template_agmxdlx",
                    {
                        recipient_name: form.getValues("email")?.split("@")[0] || "User",
                        sender_name: `${userName}`,
                        sender_role: "Company Head",
                        target_role: "IT Head",
                        invite_message: "Hope you will enjoy the journey",
                        company_name: data?.companyName || "Company",
                        invite_link: inviteLink,
                        support_email: `support@${(data?.companyName || "company").toLowerCase().replace(/\s+/g, "")}.com`,
                        email: form.getValues("email")
                    },
                    {
                        publicKey: EMAILJS_PUBLIC_KEY
                    }
                );


                toast.success("Admin invite sent successfully");
                form.reset();
            } catch (e) {
                console.error("EmailJS error:", e);
                toast.error("Invite created, but email sending failed");
            }
        },
        onError: (err) => {
            toast.error("Admin Invite not send")
            form.reset()
        },
    });

    useEffect(() => {
        if (!companyLoading && data) {
            form.reset({
                email: form.getValues("email") || "",
                role: form.getValues("role") || "admin",
                companyName: data.companyName ?? "",
                companyLocation: data.companyLocation ?? ""
            })
        }
    }, [companyLoading, data, form])

    function onSubmit(values) {

        // extract the values 

        const { email } = values
        const payload = {
            clerkId: user.id,
            receipientEmail: email,
            companyId: data.companyId
        }
        mutation.mutate(payload)
    }



    return (
        <div className="mx-auto max-w-2xl py-8">
            <div className="mb-8 space-y-2 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Expand Your Team
                </h1>
                <p className="text-lg text-slate-600">
                    Invite an <span className="font-semibold text-emerald-600">IT Manager</span> to streamline your company's asset operations.
                </p>
            </div>

            <Card className="border-none bg-white shadow-xl ring-1 ring-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Invitation Details</CardTitle>
                    <CardDescription className="text-slate-500">
                        Enter the colleague's email address below safely.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8">
                    <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FieldGroup className="space-y-6">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-slate-700 font-medium" htmlFor="invite-form-email">
                                            Recipient Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="invite-form-email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="e.g. ithead@yourcompany.com"
                                            autoComplete="off"
                                            className="h-11 transition-all focus:ring-2 focus:ring-emerald-500"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <Controller
                                    name="role"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-role">
                                                Assigning Role
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="invite-form-role"
                                                aria-invalid={fieldState.invalid}
                                                disabled
                                                className="bg-slate-50 font-medium text-slate-500 border-dashed cursor-not-allowed"
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="companyName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-company-name">
                                                Company
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="invite-form-company-name"
                                                aria-invalid={fieldState.invalid}
                                                disabled
                                                className="bg-slate-50 font-medium text-slate-500 border-dashed cursor-not-allowed"
                                            />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="companyLocation"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-company-location">
                                            Organization Location
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="invite-form-company-location"
                                            aria-invalid={fieldState.invalid}
                                            disabled
                                            className="bg-slate-50 font-medium text-slate-500 border-dashed cursor-not-allowed"
                                        />
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 bg-slate-50/50 border-t border-slate-100 p-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.reset()}
                        disabled={mutation.isPending}
                        className={`w-full sm:w-auto text-slate-500 hover:text-slate-700 ${mutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        Clear Form
                    </Button>
                    {
                        mutation.isPending ? (
                            <span className="flex items-center gap-2 text-slate-900">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            <Button
                                type="submit"
                                form="invite-form"
                                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 shadow-sm transition-all active:scale-[0.98]"
                            >
                                Send Invitation
                            </Button>
                        )
                    }
                </CardFooter>
            </Card>

        </div>
    )
}

export default InviteEmployer
