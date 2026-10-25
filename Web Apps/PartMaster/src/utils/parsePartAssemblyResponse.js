function parseDataPayload(data, key) {
  if (!data || !Array.isArray(data.Data)) {
    return [];
  }

  let rowsObj = {};
  data.Data.forEach((entry) => {
    if (typeof entry === 'string' && entry.includes(key)) {
      rowsObj = JSON.parse(entry);
    }
  });

  return Array.isArray(rowsObj[key]) ? rowsObj[key] : [];
}

export function parsePartAssemblyTreeResponse(data) {
  return parseDataPayload(data, 'PARTASSEMBLY');
}

export function parsePartAssemblyDetailResponse(data) {
  const rows = parseDataPayload(data, 'PARTASSEMBLYPARTDETAIL');
  return rows[0] ?? null;
}
