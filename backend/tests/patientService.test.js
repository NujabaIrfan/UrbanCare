import { beforeEach, describe, expect, jest } from "@jest/globals";

//mock before importing the service
jest.unstable_mockModule('uuid', () => ({
    v4: jest.fn(()=> '12345678-abcd-efgh-ijkl-123456789012')
}));

jest.unstable_mockModule('qrcode', () => ({
    default:{
        toDataURL: jest.fn()
    }
}));

//imports
const {generatePatientId, generateQRCode} = await import('../services/patientService.js');
const {v4: uuidv4} = await import('uuid');
const QRCode = await import('qrcode');;

describe('PatientService', () => {
    beforeEach(()=>{
        jest.clearAllMocks();
    });

    describe('generatePatientId', ()=>{
        it('should generate id in PAT-XXXXXXXX format', ()=>{
            const result = generatePatientId();

            expect(result).toBe('PAT-12345678');
            expect(result).toMatch(/^PAT-[A-Z0-9]{8}$/);
        });
    });
    
    describe('generateQRCode', ()=>{
        it('should generate QR code from patient id', async ()=>{
            QRCode.default.toDataURL.mockResolvedValue('data:image/png;base64,mockQR');

            const result=await generateQRCode('PAT-12345678');

            expect(QRCode.default.toDataURL).toHaveBeenCalledWith('PAT-12345678');
            expect(result).toBe('data:image/png;base64,mockQR');
        });

        it('should throw error if QR generation fails', async()=>{
            QRCode.default.toDataURL.mockRejectedValue(new Error('QR failed'));

            await expect(generateQRCode('PAT-12345678'))
            .rejects.toThrow('QR failed');
        });
    });
});
