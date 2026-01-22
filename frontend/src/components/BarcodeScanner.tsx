import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Check } from "lucide-react";
import Quagga from "quagga";

const BarcodeScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const scannerRef = useRef(null);

  const startScanner = () => {
    setError("");

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment",
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader",
          ],
          debug: {
            drawBoundingBox: true,
            showFrequency: true,
            drawScanline: true,
            showPattern: true,
          },
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 4,
        frequency: 10,
      },
      (err) => {
        if (err) {
          console.error("Quagga initialization error:", err);
          setError(
            "Camera access denied or not available. Please use manual entry.",
          );
          return;
        }

        Quagga.start();
        setIsScanning(true);
      },
    );

    Quagga.onDetected(handleDetected);
  };

  const handleDetected = (result) => {
    if (result && result.codeResult && result.codeResult.code) {
      const code = result.codeResult.code;

      // Filter out false positives by checking format
      if (code.length >= 8 && code.length <= 13) {
        setScannedCode(code);
        stopScanner();
      }
    }
  };

  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
      setIsScanning(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      setScannedCode(manualCode.trim());
      setManualCode("");
    }
  };

  const handleReset = () => {
    setScannedCode("");
    setManualCode("");
    setError("");
  };

  const handleContinue = () => {
    if (onScanComplete) {
      onScanComplete(scannedCode);
    }
    handleReset();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">UPC Scanner</h2>

      {!scannedCode ? (
        <>
          {/* Camera Scanner Section */}
          <div className="mb-6">
            <div
              className="relative bg-gray-900 rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              {isScanning ? (
                <>
                  <div
                    ref={scannerRef}
                    className="w-full h-full"
                    style={{ position: "relative" }}
                  >
                    <canvas
                      className="drawingBuffer"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-32 border-2 border-red-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500"></div>
                    </div>
                  </div>

                  <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white text-center py-2 text-sm">
                    Position barcode within the red frame
                  </div>

                  <button
                    onClick={stopScanner}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-10"
                  >
                    <X size={24} />
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={startScanner}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Camera size={24} />
                    Start Camera
                  </button>
                </div>
              )}
            </div>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            {isScanning && (
              <p className="mt-2 text-gray-600 text-sm text-center">
                Scanning for barcodes...
              </p>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Manual Entry
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
                placeholder="Enter UPC code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Check size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Supports EAN, UPC, Code 128, and Code 39 formats
            </p>
          </div>
        </>
      ) : (
        /* Scanned Result */
        <div className="text-center">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-4">
            <Check size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Code Scanned
            </h3>
            <p className="text-3xl font-mono font-bold text-gray-900">
              {scannedCode}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Scan Another
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
