import { useEffect, useRef, useState } from 'react';

/**
 * A reusable text component that shows a tooltip when the text is truncated.
 *
 * @component
 * @example
 * // Basic Usage:
 * <UxcShowMoreInfo text="Some long text that might be truncated" />
 *
 * // Array Usage:
 * <UxcShowMoreInfo text={["Part 1", "Part 2"]} separator=" - " /> 
 *
 * // Array of Objects Usage:
 * <UxcShowMoreInfo text={[{ code: 'A1' }, { code: 'B2' }]} columns="code" separator=", " />
 *
 * @param {Object} props - The component props.
 * @param {string|string[]|Object[]} props.text - The text, list of text fragments, or list of objects to display.
 * @param {string|string[]} [props.columns] - Column name(s) to read when text is an array of objects.
 * @param {string} [props.separator=' '] - Separator used when text is an array.
 * @param {string} [props.font='inherit'] - Font family used to render the text.
 * @returns {JSX.Element} The rendered text component.
 */


export default function UxcShowMoreInfo({ text, columns, separator = ' ', font = 'inherit' }) {
  const textRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const columnList = Array.isArray(columns) ? columns : columns ? [columns] : [];
  const isObjectArray = Array.isArray(text) && text.every((item) => item == null || typeof item === 'object');

  const rowTexts = isObjectArray
    ? text
        .map((item) => {
          if (item == null || columnList.length === 0) {
            return '';
          }

          return columnList
            .map((column) => item[column])
            .filter((value) => value !== undefined && value !== null)
            .map((value) => String(value))
            .join(separator);
        })
        .filter((rowValue) => rowValue)
    : [];

  const displayText = isObjectArray
    ? rowTexts.join('\n')
    : Array.isArray(text)
    ? text
        .flatMap((item) => {
          if (item == null) {
            return [];
          }

          return [String(item)];
        })
        .join(separator)
    : (text ?? '');

  const updateTooltipVisibility = () => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const childRowTruncated = Array.from(element.children).some(
      (child) => child.scrollWidth > child.clientWidth || child.scrollHeight > child.clientHeight
    );
    const isTruncated = childRowTruncated || element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
    setShowTooltip(isTruncated);
  };

  useEffect(() => {
    updateTooltipVisibility();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const element = textRef.current;

    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateTooltipVisibility();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [displayText, isObjectArray]);

  const handleMouseEnter = () => {
    updateTooltipVisibility();
  };

  return (
    <div
      ref={textRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      title={showTooltip ? displayText : undefined}
      style={{
        width: 'inherit',
        fontFamily: font,
        whiteSpace: isObjectArray ? 'normal' : 'nowrap',
        overflow: 'hidden',
        textOverflow: isObjectArray ? 'clip' : 'ellipsis',
      }}
    >
      {isObjectArray
        ? rowTexts.map((rowValue, index) => (
            <div
              key={`${rowValue}-${index}`}
              title={showTooltip ? rowValue : undefined}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {rowValue}
            </div>
          ))
        : displayText}
    </div>
  );
}
