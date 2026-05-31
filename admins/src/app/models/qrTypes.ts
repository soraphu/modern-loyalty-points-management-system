export interface GenerateQrRequest {
    points: number;
    generatedBy: string; // Admin/Staff ID
}

export interface GenerateQrResponse {
    success: boolean;
    qrCodeUrl: string; // The URL string or base64 data injected into the QR view frame
    token: string;
    expiresInSeconds: number;
}