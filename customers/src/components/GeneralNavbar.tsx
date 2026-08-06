import { Link } from "react-router-dom"
import { ArrowLeft, Coins, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/config/AuthContext";

const GeneralNavbar = ({ backgroundColor }: { backgroundColor: string }) => {
    const { profile } = useAuth();
    const userPoints = profile?.totalPoints;


    return (
        <header className={`border-b sticky top-0 z-10 px-4 py-4 shadow-sm ${backgroundColor}`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link to="/" className='p-2.5 rounded-full text-white hover:bg-black/20 active:bg-black/40 active:scale-90 transition-all duration-150 focus:outline-none'>
                    <ArrowLeft />
                </Link>
                <div className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-white" />
                    <h1 className="text-xl font-black tracking-tight text-white">Available Rewards</h1>
                </div>

                <Badge variant="secondary" className="px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border-zinc-200 flex items-center gap-1.5 font-bold">
                    <Coins className="h-4 w-4" />
                    <span>{userPoints} Points</span>
                </Badge>
            </div>
        </header>
    )
}

export default GeneralNavbar