import { ShieldUser } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "../ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { User, LogOut } from "lucide-react"
import { useHomeViewModel } from "@/app/viewmodels/useHomeViewModel"

export const NavigationBar = ({ currentUser }: { currentUser: any }) => {
    const { handleLogout } = useHomeViewModel();

    return (
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
    )
}// end