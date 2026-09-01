import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Gift, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/config/apiClient';
import { API_PATH, filterErrorMessage } from '@/config/constant';
import AuthAction from '@/config/authAction';

interface AddRewardDialogProps {
    onSuccess?: () => void;
}

export default function AddRewardDialog({ onSuccess }: AddRewardDialogProps) {
    const [open, setOpen] = useState(false);
    const [rewardName, setRewardName] = useState('');
    const [pointsCost, setPointsCost] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { action } = AuthAction();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const resetForm = () => {
        setRewardName('');
        setPointsCost('');
        setImagePreview(null);
        setImageFile(null);
        setIsSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rewardName.trim()) {
            toast.error('Please enter a valid reward name.');
            return;
        }

        const cost = parseInt(pointsCost, 10);
        if (isNaN(cost) || cost <= 0) {
            toast.error('Points cost must be a positive number.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                reward_name: rewardName.trim(),
                points_cost: cost,
                active: true,
                image_url: imagePreview || null,
            };

            await action(async () => await apiClient.post(API_PATH.createReward, payload));

            toast.success('Reward item created successfully!');
            setOpen(false);
            resetForm();
            onSuccess?.();
        } catch (err: any) {
            const cleanMsg = filterErrorMessage(err);
            toast.error(cleanMsg.msg || 'Failed to create reward item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm gap-1.5 cursor-pointer h-9 animate-in fade-in duration-200">
                    <Plus className="h-4 w-4" /> Add Reward
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-wide flex items-center gap-2 text-white">
                        <Gift className="h-5 w-5 text-blue-500" />
                        Create New Reward
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Fill in the details below to add a new reward item to the catalog.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* REWARD NAME INPUT */}
                    <div className="space-y-1.5">
                        <Label htmlFor="rewardName" className="text-sm font-medium text-zinc-300">
                            Reward Name
                        </Label>
                        <Input
                            id="rewardName"
                            type="text"
                            required
                            disabled={isSubmitting}
                            value={rewardName}
                            onChange={(e) => setRewardName(e.target.value)}
                            placeholder="Ex: Free Thai Tea"
                            className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500"
                        />
                    </div>

                    {/* POINTS COST INPUT */}
                    <div className="space-y-1.5">
                        <Label htmlFor="pointsCost" className="text-sm font-medium text-zinc-300">
                            Points Cost
                        </Label>
                        <Input
                            id="pointsCost"
                            type="number"
                            required
                            min="1"
                            disabled={isSubmitting}
                            value={pointsCost}
                            onChange={(e) => setPointsCost(e.target.value)}
                            placeholder="Ex: 200"
                            className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    {/* REWARD PICTURE UPLOAD INPUT */}
                    <div className="space-y-1.5">
                        <Label htmlFor="rewardPicture" className="text-sm font-medium text-zinc-300">
                            Reward Picture
                        </Label>

                        {imagePreview ? (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center group">
                                <img src={imagePreview} alt="Reward preview" className="w-full h-full object-cover" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    disabled={isSubmitting}
                                    onClick={handleClearImage}
                                    className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-90 hover:opacity-100 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg p-4 bg-zinc-950/50 hover:border-zinc-700 transition-colors">
                                <ImageIcon className="h-8 w-8 text-zinc-600 mb-2" />
                                <label htmlFor="rewardPicture" className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                                    <Upload className="h-3.5 w-3.5" /> Upload Image
                                </label>
                                <span className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                                <Input
                                    id="rewardPicture"
                                    type="file"
                                    accept="image/*"
                                    disabled={isSubmitting}
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        )}
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
                                    Creating...
                                </>
                            ) : (
                                "Add Reward"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
