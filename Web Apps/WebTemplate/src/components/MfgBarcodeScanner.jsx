import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * MfgBarcodeScanner component
 * Props:
 *   onScan: function(decodedText) - called when a barcode is successfully scanned
 *   onClose: function() - called when scanner is closed/cancelled
 */
function MfgBarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        onScan(decodedText);
        html5QrCode.stop().then(onClose);
      },
      (errorMessage) => {
        // Optionally handle scan errors
      }
    );
    scannerRef.current = html5QrCode;
    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onScan, onClose]);

  return (
    <div>
      <div id="qr-reader" style={{ width: 300, height: 300 }} />
      <button onClick={() => {
        scannerRef.current && scannerRef.current.stop().then(onClose);
      }}>Cancel</button>
    </div>
  );
}

export default MfgBarcodeScanner;
