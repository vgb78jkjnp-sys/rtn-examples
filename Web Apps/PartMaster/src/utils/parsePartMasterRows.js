export function parsePartMasterRowsResponse(data) {
  if (!data || !Array.isArray(data.Data)) {
    return [];
  }

  let rowsObj = {};
  data.Data.forEach((entry) => {
    if (typeof entry === 'string' && entry.includes('PARTMASTER')) {
      rowsObj = JSON.parse(entry);
    }
  });

  return Array.isArray(rowsObj.PARTMASTER) ? rowsObj.PARTMASTER : [];
}
