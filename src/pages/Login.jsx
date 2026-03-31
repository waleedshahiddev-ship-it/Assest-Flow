import { SignIn } from "@clerk/react"
import { Card } from "../components/ui/card"

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="hidden md:flex flex-col justify-center space-y-8 pr-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                            Enterprise Solution
                        </div>
                        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                            Asset Flow
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-md">
                            The enterprise-grade solution for streamlined asset management and role-based operations.
                        </p>
                    </div>
                    
                    <div className="space-y-5">
                        {[
                            { title: "Asset Lifecycle", desc: "Track every asset from acquisition to disposal." },
                            { title: "Role-Based Access", desc: "Granular permissions for every team member." },
                            { title: "Audit Ready", desc: "Real-time logs for complete transparency." },
                            { title: "Cloud Scale", desc: "Built to grow with your infrastructure." }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{feature.title}</h4>
                                    <p className="text-slate-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center md:justify-end">
                    <Card className="w-full max-w-[440px] border-none shadow-2xl bg-white overflow-hidden rounded-2xl">
                        <SignIn 
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none border-none p-4 sm:p-8",
                                    headerTitle: "text-2xl font-bold text-slate-900",
                                    headerSubtitle: "text-slate-500",
                                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-all shadow-sm normal-case h-11",
                                    footerActionLink: "text-indigo-600 hover:text-indigo-700 font-semibold",
                                    formFieldInput: "h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg",
                                    dividerLine: "bg-slate-100",
                                    dividerText: "text-slate-400 text-xs uppercase tracking-wider",
                                    identityPreviewText: "text-slate-600",
                                    identityPreviewEditButton: "text-indigo-600 font-semibold"
                                }
                            }}
                            path="/login"
                            routing="path"
                            signUpUrl="/register"
                        />
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Login