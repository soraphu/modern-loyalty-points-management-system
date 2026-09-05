import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import type { AdminRole } from '@/app/models/adminTypes';

export interface NewAdminForm {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    role: AdminRole;
}

interface AddAdminDialogProps {
    isLoading: boolean;
    onSubmit: (form: NewAdminForm) => Promise<void>;
}

const initialForm: NewAdminForm = {
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    role: 'STAFF',
};

export default function AddAdminDialog({ isLoading, onSubmit }: AddAdminDialogProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);

    const update = (field: keyof NewAdminForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value } as NewAdminForm));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSubmit(form);
        setForm(initialForm);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add admin
                </Button>
            </DialogTrigger>

            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-50 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create admin account</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Provision a new console login for your team.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['firstname', 'lastname', 'username', 'password'] as const).map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={`new-admin-${field}`}>
                                {field === 'password'
                                    ? 'Password'
                                    : field[0].toUpperCase() + field.slice(1)}
                            </Label>
                            <div className="relative">
                                <Input
                                    id={`new-admin-${field}`}
                                    type={
                                        field === 'password' && !showPassword
                                            ? 'password'
                                            : 'text'
                                    }
                                    minLength={field === 'password' ? 8 : undefined}
                                    required
                                    value={form[field]}
                                    onChange={(event) => update(field, event.target.value)}
                                    disabled={isLoading}
                                    className={
                                        field === 'password'
                                            ? 'border-zinc-800 bg-zinc-950 pr-10'
                                            : 'border-zinc-800 bg-zinc-950'
                                    }
                                />
                                {field === 'password' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        title={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        disabled={isLoading}
                                        className="absolute right-1  h-8 w-8  text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="new-admin-role">Role</Label>
                        <select
                            id="new-admin-role"
                            value={form.role}
                            onChange={(event) => update('role', event.target.value)}
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-50"
                        >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                            <option value="OWNER">Owner</option>
                        </select>
                    </div>

                    <DialogFooter className="sm:col-span-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} variant={'default'} className='bg-green-400'>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create admin'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
