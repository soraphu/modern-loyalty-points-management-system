import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, QrCode, Ticket, Gift, Users, ShieldCogCorner, History, LogOut, User, ShieldUser, FileClock, type LucideProps } from 'lucide-react';

export default function HomePage() {
    const { currentUser, isLoading, checkPermission, handleLogout } = useHomeViewModel();

    const staffColorSideClassName = 'group-hover:text-blue-400 group-active:text-blue-400';
    const managerColorSideClassName = 'group-hover:text-amber-400 group-active:text-amber-400';
    const ownerColorSideClassName = 'group-hover:text-red-400 group-active:text-red-400';

    if (isLoading || !currentUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const ActionButton = ({ Icon, iconOnHover, title }: { Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>, iconOnHover: string, title: string }) => {
        return (
            <button className='bg-app-foreground cursor-pointer w-full items-center px-6 py-4 border-b border-zinc-800/60 text-left hover:bg-zinc-700 active:bg-zinc-600 transition-colors group'>
                <div className='transition-transform duration-300 group-hover:translate-x-2 flex flex-row gap-4' >
                    <Icon className={`h-6 w-6 text-zinc-400 transition-colors ${iconOnHover}`} />
                    <span className="text-base font-semibold text-zinc-100">{title}</span>
                </div>
            </button>
        )
    }

    const RoleTitle = () => {
        const role = currentUser.role;
        if (role === 'STAFF') return (
            <span className="underline decoration-green-400 text-green-400 underline-offset-2">{role}</span>
        )
        if (role === 'MANAGER') return (
            <span className="underline  decoration-blue-300 text-blue-300 underline-offset-2">{role}</span>
        )
        if (role === 'OWNER') return (
            <span className="underline decoration-orange-400 text-orange-400 underline-offset-2">{role}</span>
        )

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
                        ROLE : <span className="underline decoration-white underline-offset-2">{currentUser.role}</span>
                    </p>
                </div>

                <div className="space-y-0.5 hidden sm:block">
                    <button className='cursor-pointer' onClick={() => window.location.href = '/home'} >
                        <h1 className="text-xl font-black tracking-wider text-app-primary">
                            ADMIN OF DEEPOINTS
                        </h1>
                    </button>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                        ROLE : <RoleTitle />
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

                    <DropdownMenuContent align="end" className="w-56 bg-app-foreground border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{currentUser.firstname} {currentUser.lastname}</p>
                                <p className="text-xs leading-none text-zinc-400">@{currentUser.username}</p>
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

                    <ActionButton Icon={QrCode} iconOnHover={staffColorSideClassName} title='Generate Code' />
                    <ActionButton Icon={Ticket} iconOnHover={staffColorSideClassName} title='Find Voucher' />
                    <ActionButton Icon={Gift} iconOnHover={staffColorSideClassName} title='All Rewards' />
                    <ActionButton Icon={FileClock} iconOnHover={staffColorSideClassName} title='Executed Transactions' />

                    {/* ==========================================
                        CONDITIONAL SEPARATORS AND HIGHER PRIVILEGED BUTTONS
                        ========================================== */}
                    {checkPermission('MANAGER') && (
                        <>
                            <hr />
                            <ActionButton Icon={History} iconOnHover={managerColorSideClassName} title='All Transactions' />
                            <ActionButton Icon={Users} iconOnHover={managerColorSideClassName} title='Manage Customers' />
                        </>
                    )}

                    {checkPermission('OWNER') && (
                        <>
                            <hr />
                            <ActionButton Icon={ShieldCogCorner} iconOnHover={ownerColorSideClassName} title='Manage Admins' />
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}