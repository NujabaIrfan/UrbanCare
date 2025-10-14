import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");
  const [scanStatus, setScanStatus] = useState(""); //success or error
  const html5QrCodeRef = useRef(null);

  const fetchPatientByQR = async (qrCode) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/patients/lookup/${qrCode}`
      );

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
        setError("");
        setScanStatus("success");
      } else {
        setPatient(null);
        setError("Patient not found");
        setScanStatus("error");
      }
    } catch (err) {
      setPatient(null);
      setError("Error fetching patient data");
      setScanStatus("error");
    }
  };

  const startScanning = async () => {
    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedData(decodedText);
          fetchPatientByQR(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          //scan errors - ignore
        }
      );

      setIsScanning(true);
      setPatient(null);
      setError("");
      setScanStatus("");
    } catch (err) {
      console.error("Error starting scanner: ", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
          setIsScanning(false);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
          setIsScanning(false);
        });
    } else {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch((err) => console.error(err));
      }
    };
  }, [isScanning]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">QR Code Scanner</h1>

        {/* scanner container */}
        <div
          className={`bg-white rounded-lg shadow-lg p-6 mb-6 transition-all duration-300 ${
            scanStatus === "success"
              ? "border-4 border-green-500"
              : scanStatus === "error"
              ? "border-4 border-red-500"
              : ""
          }`}
        >
          <div id="qr-reader" className="mb-4 rounded-lg overflow-hidden"></div>

          <div className="flex gap-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold transition"
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-semibold transition"
              >
                Stop Scanning
              </button>
            )}
          </div>

          {scannedData && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">Scanned Code: </p>
              <p className="font-mono font-semibold">{scannedData}</p>
            </div>
          )}
        </div>

        {/* success or error feedback */}
        {scanStatus === "success" && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-4xl">✅</span>
            <div>
              <p className="font-semibold text-green-800 text-lg">
                Patient Found!
              </p>
              <p className="text-green-700">
                Patient record loaded successfully
              </p>
            </div>
          </div>
        )}

        {scanStatus === "error" && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-4xl">❌</span>
            <div>
              <p className="font-semibold text-red-800 text-lg">Not Found</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* patient record display */}
        {patient && (
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-green-700">
              Patient Record
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">
                  Patient ID:{" "}
                </span>
                <span className="font-mono">{patient.patientId}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Name:</span>
                <span>{patient.name}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Age:</span>
                <span>{patient.age} years</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Gender:</span>
                <span>{patient.gender}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-600">Contact:</span>
                <span>{patient.contact}</span>
              </div>

              {patient.medicalHistory && (
                <div className="pt-2">
                  <span className="font-semibold text-gray-600 block mb-2">
                    Medical History:
                  </span>
                  <p className="bg-gray-50 p-3 rounded text-gray-700">
                    {patient.medicalHistory}
                  </p>
                </div>
              )}

              {patient.qrCode && (
                <div className="pt-2 text-center">
                  <span className="font-semibold text-gray-600 block mb-2">
                    QR Code:
                  </span>
                  <img
                    src={patient.qrCode}
                    alt="Patient QR"
                    className="mx-auto w-32 h-32"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
