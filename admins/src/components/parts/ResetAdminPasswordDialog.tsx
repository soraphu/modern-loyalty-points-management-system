import { useState } from 'react';
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
import { KeyRound, Loader2 } from 'lucide-react';
import type { ManagedAdmin } from '@/app/models/adminTypes';

interface ResetAdminPasswordDialogProps {
    admin: ManagedAdmin | null;
    isLoading: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
}

export default function ResetAdminPasswordDialog({
    admin,
    isLoading,
    onClose,
    onSubmit,
}: ResetAdminPasswordDialogProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSubmit(password);
        setPassword('');
    };

    return (
        <Dialog
            open={!!admin}
            onOpenChange={(open) => !open && !isLoading && onClose()}
        >
            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-50 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue-400" />
                        Reset password
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Set a new password for @{admin?.username}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reset-password">New password</Label>
                        <Input
                            id="reset-password"
                            type="password"
                            minLength={8}
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
