import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

// Define strict types for our user data structure
interface MainHeaderProps {
    profile: {
        user: {
            linePictureUrl?: string | null;
            lineDisplayName: string;
            totalPoints: number;
        };
    };
    onLogout: () => void;
}

export function MainHeader({ profile, onLogout }: MainHeaderProps) {
    return (
        <>
            {/* 🧭 BRAND HEADER STATE BANNER */}
            <header className="bg-app-foreground p-5 pb-6 border-b border-emerald-500/20 rounded-b-[2rem] shadow-md flex items-center gap-2">
                <img src="../src/assets/points.png" alt="App Image" className="w-14" />
                <div className="flex-1">
                    <h1 className="text-white text-xs font-black tracking-widest uppercase">Welcome To</h1>
                    <h2 className="text-white text-xl font-black tracking-tight mt-0.5 drop-shadow-sm">DEEPOINTS</h2>
                </div>
                <Button
                    onClick={onLogout}
                    variant="ghost"
                    className="text-white hover:text-red-500 hover:bg-white/10 rounded-full h-12 w-12 transition-colors cursor-pointer"
                    title="Sign Out"
                >
                    <LogOut />
                </Button>
            </header>

            {/* 💳 USER WALLET BALANCE BOARD */}
            <section className="px-5 mt-4">
                <div className="flex items-center justify-between bg-app-primary border border-white/20 backdrop-blur-md p-4 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-11 w-11 border-2 border-white/60 shadow-sm shrink-0">
                            <AvatarImage src={profile.user.linePictureUrl!} alt={profile.user.lineDisplayName} />
                            <AvatarFallback className="bg-emerald-800 text-emerald-100 text-xs font-black">LINE</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-[10px] text-black font-black uppercase tracking-wider opacity-40">Customer Profile</p>
                            <h3 className="text-sm font-black text-black truncate mt-0.5 opacity-50">{profile.user.lineDisplayName}</h3>
                        </div>
                    </div>

                    <div className="text-right shrink-0 flex gap-2">
                        <span className="text-shadow-lg text-sm md:text-lg font-black text-white tracking-tight opacity-90">
                            {profile.user.totalPoints} Points
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}