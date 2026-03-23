import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"


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




export const OnboardingForm = ({ schema, uiConfig, defaultValues = {}, onSubmit, isSubmitting = false }) => {

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    })


    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>{uiConfig?.title}</CardTitle>
                <CardDescription>
                    {uiConfig?.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="onboarding-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>

                        {
                            uiConfig?.fields.map((uiField) => (
                                <Controller
                                    key={uiField.name}
                                    name={uiField.name}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}
                                            className={uiField.hidden ? "hidden" : undefined}
                                        >
                                            <FieldLabel htmlFor={`onboarding-form-${uiField.name}`}>
                                                {uiField.label}
                                            </FieldLabel>
                                            {/* hide via explicit `hidden` flag or render conditionally if needed */}
                                            <Input
                                                {...field}
                                                id={`onboarding-form-${uiField.name}`}
                                                aria-invalid={fieldState.invalid}
                                                type={uiField.type || "text"}
                                                disabled={!!uiField.readOnly}
                                                placeholder={uiField.placeholder}
                                                autoComplete="off"

                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            ))
                        }
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <Button type="submit" form="onboarding-form" disabled={isSubmitting}>
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}