import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {

    const { register, errors, isLoading, errorMessage, onSubmit } = useLoginViewModel();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-app-background px-4 py-12 text-zinc-50 antialiased">

            {/* GLOBAL APPLICATION TITLE HEADER */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold tracking-wider text-app-primary sm:text-4xl">
                    ADMIN OF DEEPOINTS
                </h1>
                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                    Internal Control Portal
                </p>
            </div>

            {/* SHADCN FORM CONTAINER CARD */}
            <Card className="w-full max-w-md border-zinc-800 bg-app-foreground shadow-2xl text-zinc-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl font-bold text-center tracking-tight text-white flex items-center justify-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-app-primary" />
                        Administrative Sign In
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-400 text-sm">
                        Please enter your management credentials to proceed
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* SERVER EXCEPTION WARNING BANNER */}
                        {errorMessage && (
                            <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Authentication Failed</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* USERNAME INPUT ELEMENT */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Username</label>
                            <Input
                                placeholder="johndoe_admin"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('username', { required: 'Username is required.' })}
                            />
                            {errors.username && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.username.message}</p>
                            )}
                        </div>

                        {/* PASSWORD INPUT ELEMENT */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-300">Password</label>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                                {...register('password', { required: 'Password is required.' })}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-red-400 mt-0.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* FORM EXECUTION BUTTON */}
                        <Button
                            type="submit"
                            className="cursor-pointer w-full mt-2 bg-gray-600 text-app-primary hover:bg-gray-700 focus:ring-zinc-700 font-semibold transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-950" />
                                    Verifying profile...
                                </>
                            ) : (
                                "Login as Admin"
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center text-sm text-black border-t border-zinc-800/60 pt-4 bg-gray-400">
                    <p>
                        Need system access?{' '}
                        <a href="/" className="font-semibold text-blue-600 hover:text-blue-400 transition-colors hover:underline">
                            Create an owner account
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}