function normalizeParentPartId(value) {
  return value == null ? '' : String(value);
}

function formatNodeLabel(partVendorLot, quantity) {
  const lot = partVendorLot == null ? '' : String(partVendorLot);
  const qty = Number(quantity);
  if (qty > 1) {
    return `${lot} (${qty})`;
  }
  return lot;
}

/**
 * @param {object[]} rows
 * @param {string} parentPartId
 * @param {string} idPrefix
 * @returns {import('./partAssemblyTreeTypes.js').PartAssemblyTreeNode[]}
 */
export function buildPartAssemblyTreeNodes(rows, parentPartId = '', idPrefix = '') {
  const parentKey = normalizeParentPartId(parentPartId);

  return rows
    .filter((row) => normalizeParentPartId(row.ParentPartId) === parentKey)
    .map((row) => {
      const partPartId = String(row.PartPartId ?? '');
      const parentId = normalizeParentPartId(row.ParentPartId);
      const nodeId = `${idPrefix}${parentId}|${partPartId}`;
      const children = buildPartAssemblyTreeNodes(rows, partPartId, idPrefix);

      return {
        id: nodeId,
        nodeType: 'part',
        label: formatNodeLabel(row.PartVendorLot, row.Quantity),
        partId: partPartId,
        parentPartId: parentId,
        quantity: row.Quantity,
        children
      };
    });
}

/**
 * @param {object[]} rows
 * @param {string} [idPrefix]
 * @returns {import('./partAssemblyTreeTypes.js').PartAssemblyTreeNode}
 */
export function buildPartAssemblyTreeRoot(rows, idPrefix = '') {
  return {
    id: `${idPrefix}root`,
    nodeType: 'root',
    label: 'Part Assemblies',
    children: buildPartAssemblyTreeNodes(rows, '', idPrefix)
  };
}
