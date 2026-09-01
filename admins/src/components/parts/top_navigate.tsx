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
import { useAuth } from "@/config/authProvider"

export const NavigationBar = () => {
    const { handleLogout, admin} = useAuth();


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
                    ROLE : <span className="underline decoration-white underline-offset-2">{admin?.role}</span>
                </p>
            </div>

            <div className="space-y-0.5 hidden sm:block">
                <button className='cursor-pointer' onClick={() => window.location.href = '/home'} >
                    <h1 className="text-xl font-black tracking-wider text-app-primary">
                        ADMIN OF DEEPOINTS
                    </h1>
                </button>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                    ROLE : <span className="underline decoration-white underline-offset-2">{admin?.role}</span>
                </p>
            </div>

            {/* Right Side: Profile Picture Dropdown Component */}
            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-11 w-11 border-2 border-blue-400 hover:opacity-90 transition-opacity cursor-pointer shadow-md">
                        <AvatarImage src={admin?.avatarUrl} alt={admin?.username} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold uppercase">
                            {admin?.firstname[0]}{admin?.lastname[0]}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-app-foreground border-zinc-800 text-zinc-200">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{admin?.firstname} {admin?.lastname}</p>
                            <p className="text-xs leading-none text-zinc-400">@{admin?.username}</p>
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