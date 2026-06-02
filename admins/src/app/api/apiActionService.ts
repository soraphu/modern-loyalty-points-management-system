import { apiClient } from "@/config/apiClient";
import { API_PATH, filterErrorMessage } from "@/config/constant";
import type { VoucherResponse } from "../models/voucherType";

export const ApiActionService = {
    async generatePointsToken(points: string) {
        try {
            const res = await 
            apiClient.post(API_PATH.generatePointsToken, { points: parseInt(points, 10) });

            return res.data;
        } catch (err) {
            const finalErrorMsg = filterErrorMessage(err);

            throw finalErrorMsg;
        }
    },

    async fetchVoucher(code: string) {
        try {
            const res = await apiClient.get<VoucherResponse>(`${API_PATH.getVoucher}/${code.toUpperCase().trim()}`);

            return res.data;
        } catch (err) {
            const finalErrorMsg = filterErrorMessage(err);

            throw finalErrorMsg;
        }
    }
}