import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { Loader2, Gift, Users, ShieldCogCorner, History, FileClock } from 'lucide-react';
import { NavigateButtonUI } from '@/components/parts/navigate_button_ui';
import GenerateQrDialog from './GenerateQrDialog';
import FindVoucherDialog from './FindVoucherDialog';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

export default function HomePage() {
    const { admin, isLoading, checkPermission } = useHomeViewModel();

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
            <NavBar />

            {/* ==========================================
                PAGE BODY LIST BUTTONS
                ========================================== */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
                <div className="flex flex-col border border-zinc-900 bg-zinc-900/40 rounded-xl overflow-hidden shadow-xl ">

                    <GenerateQrDialog />
                    <FindVoucherDialog />
                    <Link to='/rewards' >
                        <NavigateButtonUI Icon={Gift} title='All Rewards' useColor='STAFF' />
                    </Link>

                    <NavigateButtonUI Icon={FileClock} title='Executed Transactions' useColor='STAFF' />

                    {/* ==========================================
                        CONDITIONAL SEPARATORS AND HIGHER PRIVILEGED BUTTONS
                        ========================================== */}
                    {checkPermission('MANAGER') && (
                        <>
                            <hr />
                            <Link to='/transactions' >
                                <NavigateButtonUI Icon={History} useColor='MANAGER' title='All Transactions' />
                            </Link>
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