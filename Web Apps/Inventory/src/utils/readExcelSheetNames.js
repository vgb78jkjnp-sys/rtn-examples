import * as XLSX from 'xlsx';

export function readExcelSheetNames(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', bookSheets: true });
  return workbook.SheetNames ?? [];
}

export function pickDefaultSheetName(sheetNames) {
  if (!sheetNames?.length) {
    return '';
  }

  if (sheetNames.includes('KKAQ')) {
    return 'KKAQ';
  }

  const caseInsensitive = sheetNames.find((name) => name.toLowerCase() === 'kkaq');
  if (caseInsensitive) {
    return caseInsensitive;
  }

  return sheetNames[0];
}
