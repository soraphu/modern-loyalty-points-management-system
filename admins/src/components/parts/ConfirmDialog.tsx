import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export type DialogVariant = "destructive" | "emerald" | "amber" | "default";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
    variant?: DialogVariant;
}

const VARIANT_CONFIGS = {
    destructive: {
        icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
        btnClass: "bg-rose-600 hover:bg-rose-500 text-white",
        iconBg: "bg-rose-500/10 border-rose-500/20",
    },
    emerald: {
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    amber: {
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
        iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    default: {
        icon: <Info className="h-6 w-6 text-blue-500" />,
        btnClass: "bg-blue-600 hover:bg-blue-500 text-white",
        iconBg: "bg-blue-500/10 border-blue-500/20",
    },
};

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    showCancelButton = true,
    variant = "default",
}: ConfirmDialogProps) {
    const config = VARIANT_CONFIGS[variant];

    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl rounded-2xl">
                <DialogHeader>
                    <div className={`p-2.5 rounded-xl border w-fit ${config.iconBg}`}>
                        {config.icon}
                    </div>

                    <DialogTitle className="text-xl font-black tracking-tight text-white mt-3">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm mt-1 leading-relaxed whitespace-pre-line">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-zinc-800/80 mt-2">
                    {showCancelButton && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                            onClick={onClose}
                            className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-xl"
                        >
                            {cancelText}
                        </Button>
                    )}

                    <Button
                        type="button"
                        disabled={isLoading}
                        onClick={async () => {
                            await onConfirm();
                            onClose();
                        }}
                        className={`${config.btnClass} font-bold rounded-xl active:scale-95 transition-all min-w-[100px]`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}