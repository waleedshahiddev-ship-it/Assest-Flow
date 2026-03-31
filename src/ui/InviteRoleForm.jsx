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
        return <div className="mx-auto max-w-2xl py-8">Failed to load company details</div>
    }

    return (
        <div className="mx-auto max-w-2xl py-8">
            <div className="mb-8 space-y-2 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    {pageTitle}
                </h1>
                <p className="text-lg text-slate-600">{pageDescription}</p>
            </div>

            <Card className="border-none bg-white shadow-xl ring-1 ring-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Invitation Details</CardTitle>
                    <CardDescription className="text-slate-500">
                        Enter the recipient email address below.
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
                                            placeholder="e.g. name@yourcompany.com"
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
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-role">
                                                Assigning Role
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="invite-form-role"
                                                disabled
                                                className="bg-slate-50 font-medium text-slate-500 border-dashed cursor-not-allowed"
                                            />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="companyName"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-company-name">
                                                Company
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="invite-form-company-name"
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
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel className="text-slate-600 text-xs uppercase tracking-wider" htmlFor="invite-form-company-location">
                                            Company Location
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="invite-form-company-location"
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

export default InviteRoleForm
