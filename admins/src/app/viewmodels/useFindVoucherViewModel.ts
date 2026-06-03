import React, { useState } from 'react';
import type { ExecutedVoucherResponse, Voucher } from '../models/voucherType';
import { ApiActionService } from '../api/apiActionService';
import AuthAction from '@/config/authAction';
import { consoleLogOnDev } from '@/config/constant';
import { toast } from 'sonner';

export function useFindVoucherViewModel() {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [executedVoucher, setExecutedVoucher] = useState<ExecutedVoucherResponse | null>(null);
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

    const handleFetchVoucher = async (e: React.SubmitEvent) => {
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
            const resData: any = await action(() => ApiActionService.apiFetchVoucher(code));

            setVoucher(resData.data.voucher);
        } catch (err: any) {
            consoleLogOnDev(err);
            setError(err.msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetteVoucher = async () => {

        try {
            if (!voucher) throw { msg: "Error voucher not found." };

            const resData: any = await action(() => ApiActionService.apiSettleVoucher(voucher.voucherCode));

            setExecutedVoucher(resData);
        } catch (err: any) {
            consoleLogOnDev(err);
            toast.error(err.msg);
        } finally {
            setIsLoading(false);
        }
    }

    //cancelVoucher

    return {
        handleSetteVoucher,
        isOpen,
        toggleDialog,
        code,
        setCode,
        isLoading,
        error,
        voucher,
        handleFetchVoucher,
        executedVoucher,
    };
}