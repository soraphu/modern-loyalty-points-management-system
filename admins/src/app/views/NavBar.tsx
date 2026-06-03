import { Link } from "react-router-dom"
import { LogOut, ShieldUser, User } from "lucide-react"
import { useAuth } from "@/config/authProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavBar = () => {
    const { admin, handleLogout } = useAuth();

    if (!admin) return;

    return (
        <header className="flex w-full items-center justify-between bg-blue-600 px-6 py-4 shadow-md">

            {/* Left Side: Text Brand Metrics */}
            <div className="space-y-0.5 sm:hidden">
                <Link to='/home' className="flex gap-2">
                    <ShieldUser className='text-app-primary' size={28} />
                    <h1 className="text-xl font-black tracking-wider text-app-primary">
                        DEEPOINTS
                    </h1>
                </Link>
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
        </header >
    )
}

export default NavBar