import { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './UxcForm.css';

/**
 * Reusable Bootstrap form component.
 *
 * @param {Object} data - Initial form data JSON object.
 * @param {Object[]} formDefinition - Field definition array.
 * @param {Object[]} buttonParameters - Button definition array.
 * field: {
 *   index: number,
 *   columnLabelName: string,
 *   columnName: string,
 *   columnType: 'textbox' | 'dropdown' | 'checkbox' | 'radio button' | 'textarea',
 *   fieldtype?: 'string' | 'date' | 'number' | 'boolean',
 *   dateFormat?: 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'MM-dd-yyyy',
 *   required?: boolean,
 *   min?: number,
 *   max?: number,
 *   maxlength?: number,
 *   align?: 'left' | 'center' | 'right',
 *   placeholder?: string,
 *   className?: string,
 *   defaultValue?: any,
 *   dropdownSelectionMode?: 'single' | 'multiple',
 *   options?: Object[] | Object,
 *   helpText?: React.ReactNode,
 *   endAdornment?: React.ReactNode,
 *   readOnly?: boolean,
 *   disabled?: boolean,
 *   style?: React.CSSProperties,
 *   hidden?: boolean,
 *   labelTitle?: string,
 *   labelStyle?: React.CSSProperties,
 *   labelClassName?: string,
 *   inputRef?: React.Ref,
 *   renderControl?: (context: Object) => React.ReactNode
 * }
 * button: {
 *   index: number,
 *   name: string,
 *   text: string,
 *   onClick?: (formData: Object, event: React.MouseEvent<HTMLButtonElement>) => void,
 *   className?: string,
 *   type?: 'button' | 'submit' | 'reset'
 * }
 * @param {Object} formConfig
 * formConfig: {
 *   className?: string,
 *   style?: React.CSSProperties,
 *   fieldClassName?: string,
 *   dropdownSelectionMode?: 'single' | 'multiple',
 *   formGroupRow?: boolean,
 *   labelColumnClassName?: string,
 *   controlColumnClassName?: string,
 *   dropdownOptions?: Record<string, Object[] | Object>,
 *   dateFormat?: 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'MM-dd-yyyy',
 *   submitButtonText?: string,
 *   showSubmitButton?: boolean,
 *   disabled?: boolean,
 *   idPrefix?: string
 * }
 */
function UxcForm({
  data = {},
  formDefinition = [],
  buttonParameters = [],
  formConfig = {},
  onChange,
  onSubmit
}) {
  const {
    className = '',
    style,
    fieldClassName = 'mb-3',
    dropdownSelectionMode = 'single',
    formGroupRow = false,
    labelColumnClassName = 'col-sm-3',
    controlColumnClassName = 'col-sm-9',
    dropdownOptions = {},
    dateFormat: defaultDateFormat = 'yyyy-MM-dd',
    submitButtonText = 'Submit',
    showSubmitButton = true,
    disabled: formDisabled = false,
    idPrefix = ''
  } = formConfig;

  const getFieldId = field => `${idPrefix}${field.columnName}`;

  const isFieldDisabled = field => Boolean(formDisabled || field.disabled);

  const orderedFields = useMemo(() => {
    return [...formDefinition].filter(field => !field.hidden).sort((a, b) => {
      const aIndex = Number.isFinite(a.index) ? a.index : Number.MAX_SAFE_INTEGER;
      const bIndex = Number.isFinite(b.index) ? b.index : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [formDefinition]);

  const orderedButtons = useMemo(() => {
    return [...buttonParameters].sort((a, b) => {
      const aIndex = Number.isFinite(a.index) ? a.index : Number.MAX_SAFE_INTEGER;
      const bIndex = Number.isFinite(b.index) ? b.index : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [buttonParameters]);

  const getDropdownSelectionMode = field => {
    const mode = field.dropdownSelectionMode || dropdownSelectionMode;
    return mode === 'multiple' ? 'multiple' : 'single';
  };

  const getFieldType = field => {
    const rawFieldType = (field.fieldtype ?? field.fieldType ?? 'string');
    const normalizedFieldType = String(rawFieldType).toLowerCase();

    if (['string', 'date', 'number', 'boolean'].includes(normalizedFieldType)) {
      return normalizedFieldType;
    }

    return 'string';
  };

  const normalizeDateFormat = dateFormat => {
    const rawFormat = String(dateFormat || '').trim();
    const lowerFormat = rawFormat.toLowerCase();

    if (lowerFormat === 'mm/dd/yyyy') {
      return 'MM/dd/yyyy';
    }

    if (lowerFormat === 'yyyy-mm-dd') {
      return 'yyyy-MM-dd';
    }

    if (lowerFormat === 'mm-dd-yyyy') {
      return 'MM-dd-yyyy';
    }

    return 'yyyy-MM-dd';
  };

  const getDateFormat = field => {
    return normalizeDateFormat(field.dateFormat || defaultDateFormat);
  };

  const formatDateValue = (dateValue, dateFormat) => {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
      return '';
    }

    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');

    if (dateFormat === 'MM/dd/yyyy') {
      return `${month}/${day}/${year}`;
    }

    if (dateFormat === 'MM-dd-yyyy') {
      return `${month}-${day}-${year}`;
    }

    return `${year}-${month}-${day}`;
  };

  const parseDateValue = (inputValue, dateFormat) => {
    if (inputValue instanceof Date && !Number.isNaN(inputValue.getTime())) {
      return new Date(inputValue.getFullYear(), inputValue.getMonth(), inputValue.getDate());
    }

    if (typeof inputValue !== 'string') {
      return null;
    }

    const value = inputValue.trim();
    if (!value) {
      return null;
    }

    let match;
    if (dateFormat === 'MM/dd/yyyy') {
      match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
      if (match) {
        return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
      }
    }

    if (dateFormat === 'MM-dd-yyyy') {
      match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
      if (match) {
        return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
      }
    }

    match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    return null;
  };

  const coerceFieldValue = (field, value) => {
    const fieldType = getFieldType(field);

    if (field.columnType === 'dropdown' && getDropdownSelectionMode(field) === 'multiple') {
      if (Array.isArray(value)) {
        return value;
      }
      return value === undefined || value === null ? [] : [value];
    }

    if (value === undefined || value === null) {
      if (fieldType === 'boolean' || field.columnType === 'checkbox') {
        return false;
      }
      return '';
    }

    if (fieldType === 'number') {
      if (value === '') {
        return '';
      }

      const numericValue = Number(value);
      return Number.isNaN(numericValue) ? '' : numericValue;
    }

    if (fieldType === 'boolean' || field.columnType === 'checkbox') {
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string') {
        const normalizedValue = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
          return true;
        }
        if (['false', '0', 'no', 'off', ''].includes(normalizedValue)) {
          return false;
        }
      }

      return Boolean(value);
    }

    if (fieldType === 'date') {
      const dateFormat = getDateFormat(field);
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return formatDateValue(value, dateFormat);
      }

      const parsedDate = parseDateValue(value, dateFormat) || parseDateValue(value, 'yyyy-MM-dd');
      if (parsedDate) {
        return formatDateValue(parsedDate, dateFormat);
      }

      const stringValue = String(value);
      if (stringValue.includes('T')) {
        const parsedIsoDate = parseDateValue(stringValue.split('T')[0], 'yyyy-MM-dd');
        return parsedIsoDate ? formatDateValue(parsedIsoDate, dateFormat) : stringValue.split('T')[0];
      }

      return stringValue;
    }

    return String(value);
  };

  const buildFormData = sourceData => {
    const initialData = { ...(sourceData || {}) };

    orderedFields.forEach(field => {
      const hasValue = initialData[field.columnName] !== undefined && initialData[field.columnName] !== null;
      if (!hasValue) {
        if (field.defaultValue !== undefined) {
          initialData[field.columnName] = field.defaultValue;
        } else if (field.columnType === 'dropdown' && getDropdownSelectionMode(field) === 'multiple') {
          initialData[field.columnName] = [];
        } else if (field.columnType === 'checkbox' || getFieldType(field) === 'boolean') {
          initialData[field.columnName] = false;
        } else {
          initialData[field.columnName] = '';
        }
      }

      initialData[field.columnName] = coerceFieldValue(field, initialData[field.columnName]);
    });

    return initialData;
  };

  const [internalFormData, setInternalFormData] = useState(() => buildFormData(data));
  const controlledFormData = buildFormData(data);
  const formData = onChange ? controlledFormData : internalFormData;

  const normalizeOptions = rawOptions => {
    if (!rawOptions) {
      return [];
    }

    if (Array.isArray(rawOptions)) {
      return rawOptions.map(option => {
        if (option && typeof option === 'object' && 'value' in option) {
          return {
            value: option.value,
            label: option.label ?? String(option.value)
          };
        }

        return {
          value: option,
          label: String(option)
        };
      });
    }

    if (typeof rawOptions === 'object') {
      return Object.entries(rawOptions).map(([value, label]) => ({
        value,
        label: String(label)
      }));
    }

    return [];
  };

  const getOptionsForField = field => {
    const fieldOptions = field.options;
    if (fieldOptions) {
      return normalizeOptions(fieldOptions);
    }

    return normalizeOptions(dropdownOptions[field.columnName]);
  };

  const getAlignmentClass = align => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-end';
    return 'text-start';
  };

  const updateFieldValue = (field, value) => {
    const nextData = {
      ...formData,
      [field.columnName]: coerceFieldValue(field, value)
    };

    if (onChange) {
      onChange(nextData);
      return;
    }

    setInternalFormData(nextData);
  };

  const handleSubmit = event => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    onSubmit?.(formData, event);
  };

  const renderFieldLabel = (field, className, htmlFor) => (
    <label className={className} htmlFor={htmlFor} title={field.labelTitle} style={field.labelStyle}>
      {field.columnLabelName}
      {field.helpText ? (
        <>
          {' '}
          <small className="form-text text-muted">{field.helpText}</small>
        </>
      ) : null}
    </label>
  );

  const renderInputControl = (field, showInlineCheckboxLabel = true) => {
    const control = renderBaseControl(field, showInlineCheckboxLabel);

    if (!field.endAdornment) {
      return control;
    }

    return (
      <div className="uxc-form-adornment">
        {control}
        <span className="uxc-form-adornment__end">{field.endAdornment}</span>
      </div>
    );
  };

  const renderBaseControl = (field, showInlineCheckboxLabel = true) => {
    const value = formData[field.columnName];
    const inputClassName = field.className || '';
    const fieldType = getFieldType(field);
    const isDateInput = fieldType === 'date' || field.columnType === 'date';
    const fieldId = getFieldId(field);
    const disabled = isFieldDisabled(field);
    const readOnly = Boolean(field.readOnly);

    if (typeof field.renderControl === 'function') {
      const customControl = field.renderControl({
        field,
        value,
        disabled,
        readOnly,
        inputRef: field.inputRef
      });

      if (customControl !== undefined && customControl !== null) {
        return customControl;
      }
    }

    if (field.columnType === 'dropdown') {
      const options = getOptionsForField(field);
      const mode = getDropdownSelectionMode(field);
      const isMultiple = mode === 'multiple';
      const selectedValue = isMultiple
        ? (Array.isArray(value) ? value.map(item => String(item)) : [])
        : (value ?? '');

      const handleDropdownChange = event => {
        if (!isMultiple) {
          updateFieldValue(field, event.target.value);
          return;
        }

        const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
        updateFieldValue(field, selectedOptions);
      };

      return (
        <select
          id={fieldId}
          ref={field.inputRef}
          className={`form-select ${inputClassName}`.trim()}
          style={field.style}
          multiple={isMultiple}
          value={selectedValue}
          required={Boolean(field.required)}
          disabled={disabled || readOnly}
          onChange={handleDropdownChange}
        >
          {!isMultiple && <option value="">{field.placeholder || 'Select an option'}</option>}
          {options.map(option => (
            <option key={`${field.columnName}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.columnType === 'checkbox') {
      return (
        <div className={`form-check ${inputClassName}`.trim()}>
          <input
            id={fieldId}
            className="form-check-input"
            type="checkbox"
            checked={Boolean(value)}
            required={Boolean(field.required)}
            disabled={disabled || readOnly}
            onChange={event => updateFieldValue(field, event.target.checked)}
            aria-label={field.columnLabelName}
          />
          {showInlineCheckboxLabel && renderFieldLabel(field, 'form-check-label', fieldId)}
        </div>
      );
    }

    if (field.columnType === 'radio button') {
      const options = getOptionsForField(field);
      return (
        <div className={inputClassName}>
          {options.map(option => {
            const optionId = `${fieldId}-${option.value}`;
            return (
              <div className="form-check form-check-inline" key={optionId}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={fieldId}
                  id={optionId}
                  value={option.value}
                  checked={String(value) === String(option.value)}
                  required={Boolean(field.required)}
                  disabled={disabled || readOnly}
                  onChange={event => updateFieldValue(field, event.target.value)}
                />
                <label className="form-check-label" htmlFor={optionId}>
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
      );
    }

    if (field.columnType === 'textarea') {
      return (
        <textarea
          id={fieldId}
          ref={field.inputRef}
          className={`form-control ${inputClassName}`.trim()}
          style={field.style}
          placeholder={field.placeholder || ''}
          value={value ?? ''}
          required={Boolean(field.required)}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={getFieldType(field) === 'string' && Number.isFinite(field.maxlength) ? field.maxlength : undefined}
          onChange={event => updateFieldValue(field, event.target.value)}
          rows={field.rows || 3}
        />
      );
    }

    if (isDateInput) {
      const dateFormat = getDateFormat(field);
      const selectedDate = parseDateValue(value, dateFormat) || parseDateValue(value, 'yyyy-MM-dd');

      return (
        <DatePicker
          id={fieldId}
          name={field.columnName}
          disabled={disabled}
          readOnly={readOnly}
          selected={selectedDate}
          onChange={dateValue => updateFieldValue(field, dateValue)}
          dateFormat={dateFormat}
          placeholderText={field.placeholder || ''}
          className={`form-control ${inputClassName} uxc-form-date-input`.trim()}
          wrapperClassName="uxc-form-date-picker-wrapper"
          calendarClassName="uxc-form-date-picker-calendar"
          popperClassName="uxc-form-date-picker-popper"
          required={Boolean(field.required)}
          showPopperArrow={false}
          autoComplete="off"
        />
      );
    }

    const inputType = fieldType === 'number' ? 'number' : 'text';
    const inputValue = fieldType === 'number' && value === 0 ? 0 : (value ?? '');

    return (
      <input
        id={fieldId}
        ref={field.inputRef}
        type={inputType}
        className={`form-control ${inputClassName}`.trim()}
        style={field.style}
        placeholder={field.placeholder || ''}
        value={inputValue}
        required={Boolean(field.required)}
        disabled={disabled}
        readOnly={readOnly}
        min={fieldType === 'number' && Number.isFinite(field.min) ? field.min : undefined}
        max={fieldType === 'number' && Number.isFinite(field.max) ? field.max : undefined}
        maxLength={fieldType === 'string' && Number.isFinite(field.maxlength) ? field.maxlength : undefined}
        onChange={event => updateFieldValue(field, event.target.value)}
      />
    );
  };

  return (
    <form className={`${className}`.trim()} style={style} onSubmit={handleSubmit}>
      {orderedFields.map(field => {
        if (formGroupRow) {
          return (
            <div
              key={field.columnName}
              className={`row align-items-center ${fieldClassName}`.trim()}
            >
              {renderFieldLabel(
                field,
                field.labelClassName || `${labelColumnClassName} col-form-label`,
                getFieldId(field)
              )}
              <div className={`${controlColumnClassName} ${getAlignmentClass(field.align)}`.trim()}>
                {renderInputControl(field, false)}
              </div>
            </div>
          );
        }

        return (
          <div
            key={field.columnName}
            className={`${fieldClassName} ${getAlignmentClass(field.align)}`.trim()}
          >
            {field.columnType !== 'checkbox' && renderFieldLabel(field, 'form-label', getFieldId(field))}
            {renderInputControl(field, true)}
          </div>
        );
      })}

      {showSubmitButton && (
        <button type="submit" className="btn btn-primary">
          {submitButtonText}
        </button>
      )}

      {orderedButtons.length > 0 && (
        <div className="d-flex gap-2 mt-2">
          {orderedButtons.map(button => {
            const buttonType = ['button', 'submit', 'reset'].includes(button.type) ? button.type : 'button';
            const buttonText = button.text || button.name || 'Action';
            const buttonClassName = button.className || 'btn btn-secondary';

            return (
              <button
                key={button.name || buttonText}
                name={button.name || undefined}
                type={buttonType}
                className={buttonClassName}
                onClick={event => button.onClick?.(formData, event)}
              >
                {buttonText}
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}

export default UxcForm;
