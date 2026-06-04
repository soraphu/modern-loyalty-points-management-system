export interface GenerateQrRequest {
    points: number;
    generatedBy: string; // Admin/Staff ID
}

export interface GenerateQrCodeData {
    value: string;
    qrCodeUrl: string; // The URL string or base64 data injected into the QR view frame
    expiresInMinutes: number;
}