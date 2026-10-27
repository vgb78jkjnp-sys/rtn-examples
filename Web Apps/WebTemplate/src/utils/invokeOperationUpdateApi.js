import { CALL_OPERATION_UPDATE_API } from '../config/operationUpdateApi.config';
import {
  buildRequestBodyFromRows,
  invokeApiWithPayload,
  PAYLOAD_FORMAT
} from './invokeApiWithPayload';

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
 * Invoke an operation-related API, or log its request when debug mode is off.
 */
export async function invokeOperationUpdateApiWithPayload({
  invoke,
  xmlString,
  requestBody,
  message = 'Updating operation...',
  processing,
  xmlParamName,
  payloadFormat = PAYLOAD_FORMAT.XML
} = {}) {
  const body = buildRequestBodyFromRows({
    payloadFormat,
    xmlString,
    xmlParamName,
    requestBody
  });

  if (!body) {
    throw new Error('No operation update request payload was provided.');
  }

  if (!CALL_OPERATION_UPDATE_API) {
    runProcessingStart(processing, message);

    try {
      console.log('[operation-update] Debug mode: API call skipped (CALL_OPERATION_UPDATE_API is false).');
      console.log('[operation-update] Request payload:', body);

      return {
        Status: 'success',
        Message: 'Debug mode: operation update API was not called.'
      };
    } finally {
      runProcessingEnd(processing);
    }
  }

  return invokeApiWithPayload({
    invoke,
    payloadFormat,
    xmlString,
    requestBody,
    message,
    processing,
    xmlParamName
  });
}
