import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { backgroundTheme, foregroundTheme } from '@/config/constant';

export default function RegisterPage() {
    // Bind your View hooks directly to the ViewModel state framework
    const { register, errors, isLoading, errorMessage, successMessage, onSubmit } = useRegisterViewModel(() => {
        console.log("Account created! Redirecting...");
    });

    return (
        <div className={`flex min-h-screen items-center justify-center px-4 py-12 text-zinc-50 antialiased bg-${backgroundTheme}`}>
            <Card className={`w-full max-w-md border-zinc-800 bg-${foregroundTheme} shadow-xl text-zinc-50`}>
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
                            className="w-full mt-2 bg-zinc-50 text-zinc-950 hover:bg-zinc-200 focus:ring-zinc-700 font-semibold"
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
            </Card>
        </div>
    );
}