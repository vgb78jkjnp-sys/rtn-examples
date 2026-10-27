function parseYesNoValue(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE') {
    return true;
  }
  if (normalized === 'N' || normalized === 'NO' || normalized === 'FALSE') {
    return false;
  }

  return null;
}

function findYesNoField(value, fieldNames) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const parsedYesNoValue = parseYesNoValue(value);
    if (parsedYesNoValue !== null) {
      return parsedYesNoValue;
    }

    try {
      return findYesNoField(JSON.parse(value), fieldNames);
    } catch {
      return null;
    }
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findYesNoField(entry, fieldNames);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    for (const fieldName of fieldNames) {
      const directValue = parseYesNoValue(value[fieldName]);
      if (directValue !== null) {
        return directValue;
      }
    }

    for (const nestedValue of Object.values(value)) {
      const found = findYesNoField(nestedValue, fieldNames);
      if (found !== null) {
        return found;
      }
    }
  }

  return null;
}

export function isValidUserIdResponse(validationResponse) {
  return findYesNoField(validationResponse, [
    'ValidUserId',
    'validuserid',
    'IsValidUserId',
    'isvaliduserid',
    'UserValid',
    'uservalid'
  ]) === true;
}
