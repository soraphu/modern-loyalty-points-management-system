import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Gift, Users, ShieldCogCorner, History, LogOut, User, ShieldUser, FileClock } from 'lucide-react';
import { NavigateButtonUI } from '@/components/parts/navigate_button_ui';
import GenerateQrDialog from './GenerateQrDialog';
import FindVoucherDialog from './FindVoucherDialog';

export default function HomePage() {
    const { admin, isLoading, checkPermission, handleLogout } = useHomeViewModel();

    if (isLoading || !admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-app-background text-zinc-50 antialiased">

            {/* ==========================================
                TOP NAVIGATION BAR (SOLID DEEP BLUE LAYER)
                ========================================== */}
            <header className="flex w-full items-center justify-between bg-blue-600 px-6 py-4 shadow-md">

                {/* Left Side: Text Brand Metrics */}
                <div className="space-y-0.5 sm:hidden">
                    <div >
                        <button className='cursor-pointer flex flex-row gap-2' onClick={() => window.location.href = '/home'} >
                            <ShieldUser className='text-app-primary' size={26} />
                            <h1 className="text-xl font-black tracking-wider text-app-primary">
                                DEEPOINTS
                            </h1>
                        </button>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                        ROLE : <span className="underline decoration-white underline-offset-2">{admin.role}</span>
                    </p>
                </div>

                <div className="space-y-0.5 hidden sm:block">
                    <button className='cursor-pointer' onClick={() => window.location.href = '/home'} >
                        <h1 className="text-xl font-black tracking-wider text-app-primary">
                            ADMIN OF DEEPOINTS
                        </h1>
                    </button>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                        ROLE : {admin.role}
                    </p>
                </div>

                {/* Right Side: Profile Picture Dropdown Component */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <Avatar className="h-11 w-11 border-2 border-blue-400 hover:opacity-90 transition-opacity cursor-pointer shadow-md">
                            <AvatarImage src={admin.avatarUrl} alt={admin.username} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold uppercase">
                                {admin.firstname[0]}{admin.lastname[0]}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 bg-app-foreground border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{admin.firstname} {admin.lastname}</p>
                                <p className="text-xs leading-none text-zinc-400">@{admin.username}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-600" />
                        <DropdownMenuItem className="focus:bg-zinc-700 focus:text-white cursor-pointer gap-2">
                            <User className="h-4 w-4" color='#FFFFFF' /> Account Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-600" />
                        <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-950 text-red-400 focus:text-red-300 cursor-pointer gap-2">
                            <LogOut className="h-4 w-4" color='#fc8181' /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* ==========================================
                PAGE BODY LIST BUTTONS
                ========================================== */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
                <div className="flex flex-col border border-zinc-900 bg-zinc-900/40 rounded-xl overflow-hidden shadow-xl ">

                    <GenerateQrDialog />
                    <FindVoucherDialog />
                    <NavigateButtonUI Icon={Gift} title='All Rewards' useColor='STAFF' />
                    <NavigateButtonUI Icon={FileClock} title='Executed Transactions' useColor='STAFF' />

                    {/* ==========================================
                        CONDITIONAL SEPARATORS AND HIGHER PRIVILEGED BUTTONS
                        ========================================== */}
                    {checkPermission('MANAGER') && (
                        <>
                            <hr />
                            <NavigateButtonUI Icon={History} useColor='MANAGER' title='All Transactions' />
                            <NavigateButtonUI Icon={Users} useColor='MANAGER' title='Manage Customers' />
                        </>
                    )}

                    {checkPermission('OWNER') && (
                        <>
                            <hr />
                            <NavigateButtonUI Icon={ShieldCogCorner} useColor='OWNER' title='Manage Admins' />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}