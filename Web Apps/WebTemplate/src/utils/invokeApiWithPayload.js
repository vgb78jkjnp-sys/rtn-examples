export const PAYLOAD_FORMAT = {
  JSON: 'json',
  XML: 'xml'
};

export const JSON_BODY_SHAPE = {
  FIRST_ROW: 'firstRow',
  ROWS: 'rows'
};

const DEFAULT_XML_PARAM_NAME = 'xmlParamList';

function resolveInvoke({ apiInstance, invoke }) {
  if (invoke) {
    return invoke;
  }

  if (apiInstance?.invoke) {
    return apiInstance.invoke;
  }

  throw new Error('Either invoke or apiInstance.invoke must be provided.');
}

function runProcessingStart(processing, message) {
  if (!processing) {
    return;
  }

  processing.onStart?.(message);
  processing.setMessage?.(message);
  processing.setIsProcessing?.(true);
}

function runProcessingEnd(processing) {
  if (!processing) {
    return;
  }

  processing.onEnd?.();
  processing.setMessage?.('');
  processing.setIsProcessing?.(false);
}

/**
 * Build a JSON body from a data array.
 * @param {Array<Record<string, unknown>>} rows
 * @param {object} [options]
 * @param {string} [options.shape] - firstRow | rows
 */
export function buildJsonBodyFromRows(rows, { shape = JSON_BODY_SHAPE.FIRST_ROW } = {}) {
  if (!rows?.length) {
    return null;
  }

  if (shape === JSON_BODY_SHAPE.ROWS) {
    return rows;
  }

  return rows[0];
}

/**
 * Wrap an XML string in the API request body shape used by batch endpoints.
 * @param {string} xmlString
 * @param {string} [xmlParamName]
 */
export function buildXmlRequestBody(xmlString, xmlParamName = DEFAULT_XML_PARAM_NAME) {
  if (!xmlString) {
    return null;
  }

  return {
    [xmlParamName]: xmlString
  };
}

/**
 * Convert a data array or XML string into a JSON or XML API request body.
 * @param {object} options
 * @param {Array<Record<string, unknown>>} [options.rows]
 * @param {'json'|'xml'} [options.payloadFormat]
 * @param {string} [options.xmlString] - ready-to-send XML payload
 * @param {function} [options.buildXmlBody] - (rows) => xmlString
 * @param {string} [options.jsonShape]
 * @param {function} [options.buildJsonBody] - (rows) => body
 * @param {string} [options.xmlParamName]
 * @param {object} [options.requestBody] - pre-built body
 */
export function buildRequestBodyFromRows({
  rows,
  payloadFormat = PAYLOAD_FORMAT.JSON,
  xmlString,
  buildXmlBody,
  jsonShape = JSON_BODY_SHAPE.FIRST_ROW,
  buildJsonBody,
  xmlParamName = DEFAULT_XML_PARAM_NAME,
  requestBody
} = {}) {
  if (requestBody) {
    return requestBody;
  }

  if (payloadFormat === PAYLOAD_FORMAT.XML) {
    const xml = xmlString ?? buildXmlBody?.(rows);

    return buildXmlRequestBody(xml, xmlParamName);
  }

  if (!rows?.length) {
    return null;
  }

  if (buildJsonBody) {
    return buildJsonBody(rows);
  }

  return buildJsonBodyFromRows(rows, { shape: jsonShape });
}

/**
 * Invoke an API with JSON or XML payload, block UI while running, return response.
 *
 * @param {object} options
 * @param {object} [options.apiInstance] - result of an apiInstances hook
 * @param {function} [options.invoke] - invoke(body) from apiInstance
 * @param {Array<Record<string, unknown>>} [options.rows] - tabular data for JSON payloads
 * @param {'json'|'xml'} [options.payloadFormat]
 * @param {string} [options.xmlString] - XML string for xmlParamList-style APIs
 * @param {function} [options.buildXmlBody] - (rows) => xmlString
 * @param {string} [options.jsonShape]
 * @param {function} [options.buildJsonBody]
 * @param {object} [options.requestBody]
 * @param {string} [options.message]
 * @param {object} [options.processing] - { onStart, onEnd, setMessage, setIsProcessing }
 * @returns {Promise<unknown>}
 */
export async function invokeApiWithPayload({
  apiInstance,
  invoke,
  rows,
  payloadFormat = PAYLOAD_FORMAT.JSON,
  xmlString,
  buildXmlBody,
  jsonShape = JSON_BODY_SHAPE.FIRST_ROW,
  buildJsonBody,
  xmlParamName = DEFAULT_XML_PARAM_NAME,
  requestBody,
  message = 'Processing...',
  processing
} = {}) {
  const invokeFn = resolveInvoke({ apiInstance, invoke });

  const body = buildRequestBodyFromRows({
    rows,
    payloadFormat,
    xmlString,
    buildXmlBody,
    jsonShape,
    buildJsonBody,
    xmlParamName,
    requestBody
  });

  console.log('invokeApiWithPayload: body', body);

  if (!body) {
    throw new Error('No request data was provided.');
  }

  runProcessingStart(processing, message);

  try {
    return await invokeFn(body);
  } finally {
    runProcessingEnd(processing);
  }
}

/**
 * Factory when an app shares one api definition and processing hooks.
 */
export function createApiPayloadClient({ apiInstance, invoke, processing } = {}) {
  return (options) => invokeApiWithPayload({
    apiInstance,
    invoke,
    processing,
    ...options
  });
}
