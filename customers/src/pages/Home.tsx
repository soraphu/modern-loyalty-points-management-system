import { useEffect, useState } from "react";
import liff from "@line/liff";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

// Define TypeScript structure for the profile payload
interface LineUserProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

const Home = () => {
    const [isLiffReady, setIsLiffReady] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [profile, setProfile] = useState<LineUserProfile | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize LIFF SDK when component mounts
    useEffect(() => {
        liff.init({
            liffId: "2010103019-RDfhtEOA" // 👈 LIFF ID from LINE Developers Console
        })
            .then(() => {
                setIsLiffReady(true);
                const loggedInStatus = liff.isLoggedIn();
                setIsLoggedIn(loggedInStatus);

                if (loggedInStatus) {
                    fetchLineData();
                }
            })
            .catch((err) => {
                console.error("LIFF Initialization failed", err);
                setError("Failed to link with LINE Framework.");
            });
    }, []);

    // Extract profile details and the clean token from the initialized SDK context
    const fetchLineData = async () => {
        try {
            const rawProfile = await liff.getProfile();
            setProfile(rawProfile);

            const token = liff.getAccessToken();
            setAccessToken(token);
        } catch (err: any) {
            setError("Failed to capture profile parameters.");
        }
    };

    const handleLogin = () => {
        if (!liff.isLoggedIn()) {
            liff.login(); // Opens native LINE login or redirects web browsers
        }
    };

    const handleLogout = () => {
        liff.logout();
        setIsLoggedIn(false);
        setProfile(null);
        setAccessToken(null);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">DeePoints Client Portal</CardTitle>
                    <CardDescription>
                        Integrate identity validation patterns via LINE Platform API
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium text-center">
                            {error}
                        </div>
                    )}

                    {!isLiffReady ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-6">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Initializing SDK context...</p>
                        </div>
                    ) : !isLoggedIn ? (
                        /* Logged Out View */
                        <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
                            <div className="rounded-full bg-slate-100 p-3">
                                <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Secure Handshake Required</h3>
                                <p className="text-sm text-muted-foreground px-4">Log in via LINE to register your active profile node.</p>
                            </div>
                            <Button onClick={handleLogin} className="w-full bg-[#06C755] hover:bg-[#05b04b] text-white font-medium">
                                Log in with LINE
                            </Button>
                        </div>
                    ) : (
                        /* Logged In View */
                        <div className="space-y-4">
                            {/* Profile Information */}
                            <div className="flex items-center space-x-4 rounded-lg border p-3 bg-slate-50/50">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={profile?.pictureUrl} alt={profile?.displayName} />
                                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                        {profile?.displayName?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-semibold text-sm leading-none truncate">{profile?.displayName}</h4>
                                        <Badge variant="secondary" className="text-[10px] h-4 bg-[#06C755]/10 text-[#05b04b] hover:bg-[#06C755]/10 border-none">LINE OK</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        ID: {profile?.userId}
                                    </p>
                                </div>
                            </div>

                            {/* Status Message */}
                            {profile?.statusMessage && (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status Message</span>
                                    <p className="text-sm border rounded-lg p-2.5 bg-white italic text-muted-foreground">"{profile.statusMessage}"</p>
                                </div>
                            )}

                            {/* Access Token Output Area */}
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LINE Access Token String</span>
                                <ScrollArea className="h-24 w-full rounded-md border bg-zinc-950 p-2.5 font-mono text-xs text-zinc-200">
                                    <div className="break-all whitespace-pre-wrap select-all selection:bg-zinc-700">
                                        {accessToken}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </CardContent>
                {isLoggedIn && (
                    <CardFooter className="pt-0">
                        <Button variant="outline" onClick={handleLogout} className="w-full border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive">
                            Disconnect Account
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default Home;