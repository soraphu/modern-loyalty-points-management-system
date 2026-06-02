import { useState } from 'react';
import type { Voucher } from '../models/voucherType';
import { ApiActionService } from '../api/apiActionService';
import AuthAction from '@/config/authAction';
import { consoleLogOnDev } from '@/config/constant';

export function useFindVoucherViewModel() {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const { action } = AuthAction();

    // Clear previous states when toggling the dialog modal view
    const toggleDialog = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setCode('');
            setError(null);
            setVoucher(null);
        }
    };

    const handleFetchVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setVoucher(null);

        // Frontend validation constraint check
        if (code.trim().length !== 6) {
            setError('Voucher code must be exactly 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            // Execute request targeting the voucher code route endpoint on your Render API backend
            const resData: any = await action(() => ApiActionService.fetchVoucher(code));

            setVoucher(resData.data.voucher);
        } catch (err: any) {
            consoleLogOnDev(err);
            setError(err.msg);
        } finally {
            setIsLoading(false);
        }
    };

    //setteVoucher
    //cancelVoucher

    return {
        isOpen,
        toggleDialog,
        code,
        setCode,
        isLoading,
        error,
        voucher,
        handleFetchVoucher,
    };
}