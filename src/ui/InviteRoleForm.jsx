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
import { getCompanyDetails, getUserDetails } from "../services/apiInvitations"
import { useQuery, useMutation } from '@tanstack/react-query'
import { useUser } from '@clerk/react'
import { useEffect } from 'react'
import { toast } from "sonner"
import emailjs from '@emailjs/browser'

const formSchema = z.object({
    email: z.string().email(),
    role: z.string(),
    companyName: z.string(),
    companyLocation: z.string()
})

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const InviteRoleForm = ({
    targetRole,
    senderRole,
    sendInviteFn,
    pageTitle,
    pageDescription,
    invitePathRole,
}) => {
    const { user, isLoaded } = useUser()
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    const { data: company, isLoading: companyLoading, isError: companyError } = useQuery({
        queryKey: ["Company Details of User", user?.id],
        queryFn: () => getCompanyDetails(user?.id),
        enabled: isLoaded && !!user?.id,
    })

    const { data: userProfile } = useQuery({
        queryKey: ["User Profile", user?.id],
        queryFn: () => getUserDetails(user?.id),
        enabled: isLoaded && !!user?.id,
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: targetRole,
            companyName: "",
            companyLocation: "",
        }
    })

    useEffect(() => {
        if (!companyLoading && company) {
            form.reset({
                email: form.getValues("email") || "",
                role: targetRole,
                companyName: company.companyName ?? "",
                companyLocation: company.companyLocation ?? "",
            })
        }
    }, [companyLoading, company, form, targetRole])

    const mutation = useMutation({
        mutationFn: async (payload) => sendInviteFn(payload),
        onSuccess: async (result) => {
            try {
                if (!emailJsPublicKey) {
                    throw new Error("Missing VITE_EMAILJS_PUBLIC_KEY")
                }

                const inviteToken = result?.data?.token
                const inviteLink = `${import.meta.env.VITE_APP_URL}/${invitePathRole}/invite/${inviteToken}`

                await emailjs.send(
                    "service_bl4gzfr",
                    "template_agmxdlx",
                    {
                        recipient_name: form.getValues("email")?.split("@")[0] || "User",
                        sender_name: userProfile?.full_name || user?.fullName || titleCase(senderRole),
                        sender_role: titleCase(senderRole),
                        target_role: titleCase(targetRole),
                        invite_message: `You are invited to join as ${titleCase(targetRole)}.`,
                        company_name: company?.companyName || "Company",
                        invite_link: inviteLink,
                        support_email: `support@${(company?.companyName || "company").toLowerCase().replace(/\s+/g, "")}.com`,
                        email: form.getValues("email"),
                    },
                    { publicKey: emailJsPublicKey }
                )

                toast.success(`${titleCase(targetRole)} invite sent successfully`)
                form.reset({
                    email: "",
                    role: targetRole,
                    companyName: company?.companyName || "",
                    companyLocation: company?.companyLocation || "",
                })
            } catch (error) {
                console.error("EmailJS error:", error)
                toast.error("Invite created, but email sending failed")
            }
        },
        onError: (error) => {
            toast.error(`Failed to send ${targetRole} invite`)
            console.error(error)
        }
    })

    const onSubmit = (values) => {
        const payload = {
            clerkId: user?.id,
            receipientEmail: values.email,
            companyId: company?.companyId,
        }
        mutation.mutate(payload)
    }

    if (companyError) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto max-w-2xl my-12">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Failed to load details</h3>
                <p className="mt-2 text-slate-500 max-w-xs mx-auto">We couldn't retrieve your company information. Please refresh or contact support.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 ring-1 ring-indigo-100 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {pageTitle}
                </h1>
                <p className="text-lg text-slate-500 max-w-md mx-auto">{pageDescription}</p>
            </div>

            <Card className="border-none bg-white shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-100">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-8 text-center sm:text-left">
                    <CardTitle className="text-xl font-bold text-slate-900 leading-none">Invitation Details</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-400 mt-2 italic">Fill in the recipient email to send the invitation link.</CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recipient Email Address</FieldLabel>
                                        <FieldGroup className="group focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl transition-all duration-200">
                                            <Input
                                                {...field}
                                                placeholder="e.g. name@company.com"
                                                className="h-12 border-slate-200 bg-slate-50/30 group-focus-within:bg-white group-focus-within:border-indigo-500 rounded-xl text-slate-900 font-medium placeholder:text-slate-400"
                                            />
                                        </FieldGroup>
                                        {fieldState.invalid && (
                                            <FieldError className="text-rose-500 text-xs font-bold flex items-center gap-1.5 px-1 animate-in slide-in-from-left-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {fieldState.error?.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Controller
                                    name="companyName"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field className="space-y-3">
                                            <FieldLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Branch</FieldLabel>
                                            <Input
                                                {...field}
                                                readOnly
                                                className="h-12 bg-slate-50 border-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium"
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="role"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field className="space-y-3">
                                            <FieldLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider">Assigned Role</FieldLabel>
                                            <Input
                                                {...field}
                                                readOnly
                                                className="h-12 bg-slate-50 border-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium capitalize"
                                            />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="companyLocation"
                                control={form.control}
                                render={({ field }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Location</FieldLabel>
                                        <Input
                                            {...field}
                                            readOnly
                                            className="h-12 bg-slate-50 border-slate-100 text-slate-500 rounded-xl cursor-not-allowed font-medium"
                                        />
                                    </Field>
                                )}
                            />
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="py-8 bg-slate-50/50 flex flex-col items-center border-t border-slate-50 px-8">
                    <Button
                        type="submit"
                        form="invite-form"
                        disabled={mutation.isPending}
                        className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {mutation.isPending ? (
                            <div className="flex items-center gap-3">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending Invitation...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                <span>Send Invitation Link</span>
                            </div>
                        )}
                    </Button>
                    <p className="mt-4 text-xs font-medium text-slate-400 italic">
                        The recipient will receive a secure onboarding link via email.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default InviteRoleForm
