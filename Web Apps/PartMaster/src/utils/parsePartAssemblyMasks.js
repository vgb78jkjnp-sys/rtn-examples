/**
 * @param {string} text
 * @returns {{ vendorLot: string, error?: string }}
 */
export function parsePartAssemblySerialMask(text) {
  const vendorLot = String(text ?? '').trim();

  if (!vendorLot) {
    return { vendorLot: '', error: 'Enter a serial number mask.' };
  }

  return { vendorLot };
}
