import type { LucideProps } from "lucide-react"

type actionSideColorType = 'STAFF' | 'MANAGER' | 'OWNER';

export const NavigateButtonUI = ({ Icon, title, useColor, onClick }: { Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>, title: string, useColor: actionSideColorType, onClick?: any }) => {
    let iconOnHover;
    if (useColor === 'STAFF') iconOnHover = 'group-hover:text-blue-400 group-active:text-blue-400';
    if (useColor === 'MANAGER') iconOnHover = 'group-hover:text-amber-400 group-active:text-amber-400';
    if (useColor === 'OWNER') iconOnHover = 'group-hover:text-red-400 group-active:text-red-400';

    return (
        <button onClick={onClick} className='bg-app-foreground cursor-pointer w-full items-center px-6 py-4 border-b border-zinc-800/60 text-left hover:bg-zinc-700 active:bg-zinc-600 transition-colors group'>
            <div className='transition-transform duration-300 group-hover:translate-x-2 flex flex-row gap-4' >
                <Icon className={`h-6 w-6 text-zinc-400 transition-colors ${iconOnHover}`} />
                <span className="text-base font-semibold text-zinc-100">{title}</span>
            </div>
        </button>
    )
}