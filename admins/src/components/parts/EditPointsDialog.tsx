import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Loader2 } from 'lucide-react';
import type { Customer } from '@/app/models/customerTypes';

interface EditPointsDialogProps {
    customer: Customer | null;
    isLoading: boolean;
    onClose: () => void;
    onSubmit: (newPoints: number) => Promise<void>;
}

export default function EditPointsDialog({
    customer,
    isLoading,
    onClose,
    onSubmit,
}: EditPointsDialogProps) {
    const [points, setPoints] = useState('');

    useEffect(() => {
        setPoints(customer ? String(customer.totalPoints) : '');
    }, [customer]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const nextPoints = Number(points);

        if (Number.isInteger(nextPoints) && nextPoints >= 0) {
            await onSubmit(nextPoints);
        }
    };

    return (
        <Dialog
            open={!!customer}
            onOpenChange={(open) => !open && !isLoading && onClose()}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-50 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-400" />
                        Edit total points
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Set the wallet balance for {customer?.lineDisplayName}. This replaces the current total.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-points">Total points</Label>
                        <Input
                            id="customer-points"
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={points}
                            onChange={(event) => setPoints(event.target.value)}
                            disabled={isLoading}
                            className="border-zinc-800 bg-zinc-950"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isLoading ||
                                !Number.isInteger(Number(points)) ||
                                Number(points) < 0
                            }
                            className="bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Submit change'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
