import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "emerald"; // Extend variants for your theme colors
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) {

    // Dynamic button color selector mapping based on variant choice
    const getConfirmButtonStyles = () => {
        if (variant === "destructive") return "bg-red-700 hover:bg-red-800 text-white";
        if (variant === "emerald") return "bg-[#14cc04] hover:bg-[#10a404] text-white";
        return "bg-zinc-900 hover:bg-zinc-800 text-white";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="max-w-sm rounded-[2rem] p-6 bg-white border-0 gap-6 shadow-2xl">

                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle className="text-xl font-black tracking-tight text-zinc-900">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm mt-2 leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-col gap-2 sm:gap-2">
                    {/* Main Action Button */}
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full rounded-2xl py-6 font-bold text-base transition-all active:scale-[0.98] cursor-pointer ${getConfirmButtonStyles()}`}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                            confirmText
                        )}
                    </Button>

                    {/* Dismiss Cancel Button */}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full text-zinc-700 bg-zinc-100 hover:text-zinc-900 hover:bg-zinc-200 rounded-2xl py-6 font-bold text-base cursor-pointer"
                    >
                        {cancelText}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}