import parseApiResponse from './parseApiResponse';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatRewrittenCommentHtml(text) {
  if (!text) {
    return '';
  }

  return escapeHtml(text).replace(/\r?\n/g, '<br>');
}

function readRewrittenMessage(value) {
  if (typeof value === 'string') {
    const labeledMatch = value.match(/^Rewritten Message:\s*([\s\S]*)$/im);
    return labeledMatch?.[1]?.trim() ?? '';
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }

  const rewrittenMessage = value['Rewritten Message'] ?? value.RewrittenMessage ?? value.rewrittenMessage;

  return typeof rewrittenMessage === 'string' ? rewrittenMessage.trim() : '';
}

export function parseRewriteTextResponse(response) {
  if (typeof response === 'string') {
    return readRewrittenMessage(response) || response.trim();
  }

  if (!response || typeof response !== 'object') {
    return '';
  }

  const rewrittenMessage = readRewrittenMessage(response);

  if (rewrittenMessage) {
    return rewrittenMessage;
  }

  const directText = response.responseText
    ?? response.ResponseText
    ?? response.RewrittenText
    ?? response.rewrittenText
    ?? response.Summary
    ?? response.summary
    ?? response.Text
    ?? response.text
    ?? response.Result
    ?? response.result;

  if (typeof directText === 'string' && directText.trim()) {
    return readRewrittenMessage(directText) || directText.trim();
  }

  const parsed = parseApiResponse(response);
  const datasetNames = ['REWRITE', 'Rewrite', 'SUMMARY', 'Summary'];

  for (const datasetName of datasetNames) {
    const rows = parsed.getRows(datasetName);

    if (rows.length > 0) {
      const row = rows[0];
      const rowText = row?.RewrittenText
        ?? row?.Summary
        ?? row?.Text
        ?? row?.Result
        ?? row?.Message;

      if (typeof rowText === 'string' && rowText.trim()) {
        return rowText.trim();
      }
    }
  }

  const message = parsed.message ?? response.Message ?? response.message;

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return '';
}

export function buildRewriteTextRequestBody(text, machineId = '') {
  return {
    RawText: text,
    MachineId: machineId
  };
}
