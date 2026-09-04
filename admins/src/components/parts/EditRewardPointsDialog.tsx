import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import type { RewardItem } from '@/app/models/rewardTypes';

interface EditRewardPointsDialogProps {
    reward: RewardItem;
    onAdjustPointsCost: (id: string, newPointsCost: number) => Promise<any>;
}

export default function EditRewardPointsDialog({ reward, onAdjustPointsCost }: EditRewardPointsDialogProps) {
    const [open, setOpen] = useState(false);
    const [pointsCost, setPointsCost] = useState(reward.pointsCost.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cost = parseInt(pointsCost, 10);
        if (isNaN(cost) || cost <= 0) {
            toast.error('Points cost must be a positive number.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdjustPointsCost(reward.id, cost);
            toast.success(`Updated ${reward.rewardName} points cost to ${cost}!`);
            setOpen(false);
        } catch (err: any) {
            toast.error(err?.msg || 'Failed to update reward points cost.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (isOpen) {
                setPointsCost(reward.pointsCost.toString());
            }
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Edit Points Cost"
                    className="h-fit w-fit p-2 text-zinc-400 bg-zinc-800 hover:text-blue-400 hover:bg-zinc-800/80 cursor-pointer rounded-md transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-wide flex items-center gap-2 text-white">
                        <Coins className="h-5 w-5 text-blue-500" />
                        Edit Points Cost
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Adjust point cost for <span className="text-white font-semibold">{reward.rewardName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="editPointsCost" className="text-sm font-medium text-zinc-300">
                            New Points Cost
                        </Label>
                        <Input
                            id="editPointsCost"
                            type="number"
                            required
                            min="1"
                            disabled={isSubmitting}
                            value={pointsCost}
                            onChange={(e) => setPointsCost(e.target.value)}
                            placeholder="Ex: 150"
                            className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => setOpen(false)}
                            className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer min-w-[100px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                                    Saving...
                                </>
                            ) : (
                                "Save Change"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
