import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, QrCode, Ticket, Gift, Users, ShieldAlert, History, LogOut, User } from 'lucide-react';

export default function HomePage() {
    const { currentUser, isLoading, checkPermission, handleLogout } = useHomeViewModel();

    if (isLoading || !currentUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 antialiased">

            {/* ==========================================
                TOP NAVIGATION BAR (SOLID DEEP BLUE LAYER)
                ========================================== */}
            <header className="flex w-full items-center justify-between bg-blue-600 px-6 py-4 shadow-md">

                {/* Left Side: Text Brand Metrics */}
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black tracking-wider text-white">
                        ADMIN OF DEEPOINTS
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                        ROLE : <span className="underline decoration-white underline-offset-2">{currentUser.role}</span>
                    </p>
                </div>

                {/* Right Side: Profile Picture Dropdown Component */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <Avatar className="h-11 w-11 border-2 border-blue-400 hover:opacity-90 transition-opacity cursor-pointer shadow-md">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold uppercase">
                                {currentUser.firstname[0]}{currentUser.lastname[0]}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{currentUser.firstname} {currentUser.lastname}</p>
                                <p className="text-xs leading-none text-zinc-400">@{currentUser.username}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
                            <User className="h-4 w-4" /> Account Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-950 text-red-400 focus:text-red-300 cursor-pointer gap-2">
                            <LogOut className="h-4 w-4" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* ==========================================
                PAGE BODY LIST BUTTONS
                ========================================== */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
                <div className="flex flex-col border border-zinc-900 bg-zinc-900/40 rounded-xl overflow-hidden shadow-xl">

                    {/* 1. Generate Points (Accessible to all Staff+) */}
                    <button className="flex w-full items-center gap-4 px-6 py-4 border-b border-zinc-800/60 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                        <QrCode className="h-6 w-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-base font-semibold text-zinc-100">Generate Points</span>
                    </button>

                    {/* 2. Find Voucher (Accessible to all Staff+) */}
                    <button className="flex w-full items-center gap-4 px-6 py-4 border-b border-zinc-800/60 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                        <Ticket className="h-6 w-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-base font-semibold text-zinc-100">Find Voucher</span>
                    </button>

                    {/* 3. All Rewards (Accessible to all Staff+) */}
                    <button className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                        <Gift className="h-6 w-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-base font-semibold text-zinc-100">All Rewards</span>
                    </button>

                    {/* ==========================================
                        CONDITIONAL SEPARATORS AND HIGHER PRIVILEGED BUTTONS
                        ========================================== */}
                    {checkPermission('MANAGER') && (
                        <>
                            {/* Layout Break Line for Management Layer */}
                            <div className="h-px bg-zinc-800 my-2 mx-4" />

                            {/* 4. All Transactions (MANAGER & OWNER Only) */}
                            <button className="flex w-full items-center gap-4 px-6 py-4 border-b border-zinc-800/60 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                                <History className="h-6 w-6 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                                <span className="text-base font-semibold text-zinc-100">All Transactions</span>
                            </button>

                            {/* 5. Manage Customers (MANAGER & OWNER Only) */}
                            <button className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                                <Users className="h-6 w-6 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                                <span className="text-base font-semibold text-zinc-100">Manage Customers</span>
                            </button>
                        </>
                    )}

                    {checkPermission('OWNER') && (
                        <>
                            {/* Layout Break Line for Owner Layer */}
                            <div className="h-px bg-zinc-800 my-2 mx-4" />

                            {/* 6. Manage Admins (OWNER Only) */}
                            <button className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-zinc-900/80 active:bg-zinc-900 transition-colors group">
                                <ShieldAlert className="h-6 w-6 text-zinc-400 group-hover:text-red-400 transition-colors" />
                                <span className="text-base font-semibold text-zinc-100">Manage Admins</span>
                            </button>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}