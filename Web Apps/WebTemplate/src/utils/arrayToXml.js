function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCdata(value) {
  return String(value).replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function buildXmlItems(rows, itemTag, cdataFields = []) {
  const cdataFieldSet = new Set(cdataFields);

  return rows
    .map((item) => {
      const fields = Object.entries(item)
        .map(([key, value]) => {
          const normalizedValue = value !== null && value !== undefined ? String(value) : '';

          if (cdataFieldSet.has(key) && normalizedValue) {
            return `<${key}><![CDATA[${escapeCdata(normalizedValue)}]]></${key}>`;
          }

          return `<${key}>${escapeXml(normalizedValue)}</${key}>`;
        })
        .join('');

      return `<${itemTag}>${fields}</${itemTag}>`;
    })
    .join('');
}

function buildXmlAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && String(value) !== '')
    .map(([key, value]) => `${key}="${escapeXml(String(value))}"`)
    .join(' ');
}

function buildXmlPayload({ rootTag, rootAttributes = {}, sections = [] }) {
  const sectionXml = sections
    .filter((section) => section.rows?.length > 0)
    .map(({ wrapperTag, itemTag, rows, cdataFields }) => (
      `<${wrapperTag}>${buildXmlItems(rows, itemTag, cdataFields)}</${wrapperTag}>`
    ))
    .join('');

  const attributeString = buildXmlAttributes(rootAttributes);
  const openTag = attributeString ? `<${rootTag} ${attributeString}>` : `<${rootTag}>`;

  return `${openTag}${sectionXml}</${rootTag}>`;
}

function arrayToXml(arr, tag) {
  return buildXmlItems(arr, tag);
}

export { escapeXml, buildXmlItems, buildXmlAttributes, buildXmlPayload };
export default arrayToXml;
