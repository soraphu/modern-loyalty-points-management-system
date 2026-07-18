import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Gift, QrCode, History, Ticket, LogOut, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { profile, isLoading, error, handleLogout, appearConfirmLogout, setAppearConfirmLogout } = useHomeViewModel();
    const cardCN = 'text-white border-0 rounded-[2rem] shadow-md active:scale-[0.97] transition-all cursor-pointer flex flex-col items-center justify-center text-center p-6 min-h-[160px] group text-shadow-sm hover:scale-101  md:text-shadow-md';
    const cardIconCN = 'p-4 bg-white/10 rounded-2xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform';

    // Loading UX Blocker Frame
    if (isLoading || !profile) {
        return (
            <div className="w-screen min-h-screen bg-[#8cd4b4] flex flex-col items-center justify-center space-y-4 px-6">
                <div className="bg-zinc-950/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
                    <p className="text-xs font-mono font-bold text-emerald-950 uppercase tracking-widest">
                        Securing Line Session...
                    </p>
                </div>
            </div>
        );
    }

    // Fatal Authentication Error Fallback UI
    if (error) {
        return (
            <div className="w-screen min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-50">
                <div className="border border-red-900/50 bg-red-950/20 rounded-2xl p-6 text-center space-y-4 max-w-sm">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto animate-pulse" />
                    <h3 className="text-md font-bold tracking-wide">LIFF Initialization Failed</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{error || "User context missing."}</p>
                    <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-xs font-bold">
                        Retry Connection
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen min-h-screen bg-app-background flex flex-col overflow-hidden font-sans shadow-inner">

            {/* BRAND HEADER STATE BANNER */}
            <header className="bg-app-foreground p-5 pb-6 border-b border-emerald-500/20 rounded-b-[2rem] shadow-md flex items-center gap-2">
                <img src="../src/assets/points.png" alt="App Image" className='w-14' />
                <div className="flex-1">
                    <h1 className="text-white text-xs font-black tracking-widest uppercase">Welcome To</h1>
                    <h2 className="text-white text-xl font-black tracking-tight mt-0.5 drop-shadow-sm">DEEPOINTS</h2>
                </div>

                <ConfirmDialog
                    isOpen={appearConfirmLogout}
                    onClose={() => setAppearConfirmLogout(false)}
                    onConfirm={() => {
                        handleLogout();
                        setAppearConfirmLogout(false);
                    }}
                    isLoading={isLoading}
                    title="Confirm Logout"
                    confirmText='Logout'
                    cancelText='Close'
                    variant='destructive'
                    description="Are you sure you want to logout?"
                />
                <Button
                    onClick={() => setAppearConfirmLogout(true)}
                    variant="ghost"
                    className="text-white hover:text-red-500 hover:bg-white/10 rounded-full h-12 w-12 transition-colors cursor-pointer"
                    title="Sign Out"
                >
                    <LogOut />
                </Button>
            </header>

            {/* USER WALLET BALANCE BOARD */}
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
                        <span className="text-shadow-lg text-sm md:text-lg font-black text-white tracking-tight opacity-90">{profile.user.totalPoints} Points</span>
                    </div>
                </div>
            </section>

            {/* CORE FEATURE QUAD NAVIGATION GRID */}
            <main className="flex-1 p-5 grid grid-cols-2 gap-4 md:gap-6 md:mt-4 items-stretch content-start animate-in fade-in zoom-in-95 delay-150 duration-300">

                {/* BUTTON A: REWARDS */}
                <Link to='/' >
                    <Card
                        onClick={() => console.log('Navigate to Rewards View')}
                        className={`bg-[#b40404] active:bg-[#9d1515] ${cardCN}`}
                    >
                        <CardContent className="p-0 flex flex-col items-center space-y-3">
                            <div className={cardIconCN}>
                                <Gift className="h-7 w-7 text-white stroke-[2.5]" />
                            </div>
                            <span className="text-lg font-black tracking-tight drop-shadow-sm">Rewards</span>
                        </CardContent>
                    </Card>
                </Link>

                {/* BUTTON B: EARN POINTS */}
                <Link to='/scanner' >
                    <Card
                        onClick={() => console.log('Navigate to QR Scanner View')}
                        className={`bg-[#14cc04] active:bg-[#14b106] ${cardCN}`}
                    >
                        <CardContent className="p-0 flex flex-col items-center space-y-3">
                            <div className={cardIconCN}>
                                <QrCode className="h-7 w-7 text-white stroke-[2.5]" />
                            </div>
                            <span className="text-lg font-black tracking-tight drop-shadow-sm">Scan Points</span>
                        </CardContent>
                    </Card>
                </Link>

                {/* BUTTON C: HISTORY */}
                <Link to='/' >
                    <Card
                        onClick={() => console.log('Navigate to Point Ledger Logs View')}
                        className={`bg-[#545454] active:bg-[#353535] ${cardCN}`}
                    >
                        <CardContent className="p-0 flex flex-col items-center space-y-3">
                            <div className={cardIconCN}>
                                <History className="h-7 w-7 text-white stroke-[2.5]" />
                            </div>
                            <span className="text-lg font-black tracking-tight drop-shadow-sm">History</span>
                        </CardContent>
                    </Card>
                </Link>

                {/* BUTTON D: PENDING */}
                <Link to='/' >
                    <Card
                        onClick={() => console.log('Navigate to Unused Active Vouchers List View')}
                        className={`bg-[#dd9e00] active:bg-[#b38000] ${cardCN}`}
                    >
                        <CardContent className="p-0 flex flex-col items-center space-y-3">
                            <div className={cardIconCN}>
                                <Ticket className="h-7 w-7 text-white stroke-[2.5]" />
                            </div>
                            <span className="text-lg font-black tracking-tight">Pending</span>
                        </CardContent>
                    </Card>
                </Link>
            </main>

            {/* FOOTNOTE DISCLAIMER FOOTER */}
            <footer className="p-4 text-center">
                <p className="text-[10px] font-mono text-emerald-950/40 uppercase tracking-widest">
                    Powered by Deepoints Architecture • 2026
                </p>
            </footer>
        </div >
    );
}