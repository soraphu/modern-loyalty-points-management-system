import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    // Bind your View hooks directly to the ViewModel state framework
    const { register, errors, isLoading, errorMessage, successMessage, onSubmit } = useRegisterViewModel(() => {
        console.log("Account created! Redirecting...");
    });

    return (
        <div className='flex flex-col min-h-screen items-center justify-center px-4 py-12 text-zinc-50 antialiased bg-app-background'>

            {/* Page Layout Title Header */}
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-wider text-app-primary sm:text-4xl">
                    ADMIN OF DEEPOINTS
                </h1>
                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                    Internal Management Core
                </p>
            </div>

            <Card className='w-screen h-screen sm:h-full sm:max-w-md border-zinc-800 shadow-xl text-zinc-50 bg-app-foreground'>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight text-white">
                        Create an Account
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Enter your details below to register your administrative access portal
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* GLOBAL ERROR BANNER */}
                        {errorMessage && (
                            <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Registration Failure</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* GLOBAL SUCCESS BANNER */}
                        {successMessage && (
                            <Alert className="border-emerald-900 bg-emerald-950/40 text-emerald-400">
                                <CheckCircle2 className="h-4 w-4 stroke-emerald-400" />
                                <AlertTitle className="font-semibold">Success</AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* FIRSTNAME FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">First Name</label>
                            <Input
                                placeholder="John"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('firstname', { required: 'First name is required.' })}
                            />
                            {errors.firstname && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.firstname.message}</p>
                            )}
                        </div>

                        {/* LASTNAME FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Last Name</label>
                            <Input
                                placeholder="Doe"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('lastname', { required: 'Last name is required.' })}
                            />
                            {errors.lastname && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.lastname.message}</p>
                            )}
                        </div>

                        {/* USERNAME FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Username</label>
                            <Input
                                placeholder="johndoe_admin"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('username', {
                                    required: 'Username is required.',
                                    minLength: { value: 3, message: 'Username must be at least 3 characters.' }
                                })}
                            />
                            {errors.username && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.username.message}</p>
                            )}
                        </div>

                        {/* PASSWORD FIELD */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('password', {
                                    required: 'Password is required.',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters.' }
                                })}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* SUBMIT ACTION BUTTON */}
                        <Button
                            type="submit"
                            className="w-full mt-2 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 focus:ring-zinc-700 font-semibold cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-950" />
                                    Creating account...
                                </>
                            ) : (
                                "Register as Owner"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <hr />
                <CardFooter className="justify-center bg-transparent border-t border-slate-800 pt-4 text-xs text-slate-500">
                    Enter your details to register this account. This system profile will automatically be assigned the global 'OWNER' role. Note: This is a single-occupancy administrative role; no other accounts can register with Owner privileges.
                </CardFooter>
            </Card>
        </div>
    );
}