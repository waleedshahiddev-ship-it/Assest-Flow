import { SignIn } from "@clerk/react"


const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="hidden md:flex flex-col justify-center pl-6">
                    <div className="mb-6">
                        <h1 className="text-4xl font-extrabold text-indigo-700">Asset Flow</h1>
                        <p className="mt-3 text-lg text-gray-700">Manage your company's assets efficiently, reliably, and securely.</p>
                    </div>
                    <div className="mt-6 text-sm text-gray-500 space-y-3">
                        <p className="flex items-start"><span className="mr-2 text-indigo-500">•</span>Centralized asset management</p>
                        <p className="flex items-start"><span className="mr-2 text-indigo-500">•</span>Role-based access control</p>
                        <p className="flex items-start"><span className="mr-2 text-indigo-500">•</span>Secure, audited operations</p>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">Welcome to Asset Flow</h2>
                            <p className="text-sm text-gray-500 mt-2">Sign in to continue to your dashboard</p>
                        </div>

                        <div className="space-y-4">
                            <SignIn appearance={{
                                variables: { colorPrimary: '#4F46E5' },
                                elements: { card: 'shadow-none' }
                            }}
                                path="/login"
                                routing="path"
                                signUpUrl="/register"
                                fallbackRedirectUrl="/home" />
                        </div>

                        <div className="mt-6 text-xs text-center text-gray-400">
                            By continuing you agree to our <a className="text-indigo-600 underline" href="#">terms</a> and <a className="text-indigo-600 underline" href="#">privacy policy</a>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login