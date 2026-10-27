export function canUseBarcodeScanner() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia);
}