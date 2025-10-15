// This handles business logic only
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export const generatePatientId = () => {
  return `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;
};

export const generateQRCode = async (patientId) => {
  return await QRCode.toDataURL(patientId);
};