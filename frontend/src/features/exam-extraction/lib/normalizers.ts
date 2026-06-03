const COMMA_DECIMAL_PATTERN = /^-?\d{1,3}(\.\d{3})*,\d+$/;
const DOT_DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;
const DMY_DATE_PATTERN = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const normalizeDecimalNumber = (value: string | number | null) => {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? roundDecimal(value) : null;
  }

  const sanitizedValue = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!sanitizedValue) {
    return null;
  }

  const normalizedValue = COMMA_DECIMAL_PATTERN.test(sanitizedValue)
    ? sanitizedValue.replace(/\./g, "").replace(",", ".")
    : sanitizedValue.replace(",", ".");

  if (!DOT_DECIMAL_PATTERN.test(normalizedValue)) {
    return null;
  }

  const numberValue = Number(normalizedValue);

  return Number.isFinite(numberValue) ? roundDecimal(numberValue) : null;
};

export const normalizeIntegerNumber = (value: string | number | null) => {
  const numberValue = normalizeDecimalNumber(value);

  return numberValue === null ? null : Math.round(numberValue);
};

export const normalizePercentage = (value: string | number | null) => {
  const numberValue = normalizeDecimalNumber(value);

  if (numberValue === null) {
    return null;
  }

  return numberValue >= 0 && numberValue <= 300 ? numberValue : null;
};

export const normalizeExamDate = (value: string | null) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  const isoMatch = ISO_DATE_PATTERN.exec(trimmedValue);

  if (isoMatch) {
    return toIsoDateTime({
      day: Number(isoMatch[3]),
      month: Number(isoMatch[2]),
      year: Number(isoMatch[1]),
    });
  }

  const dmyMatch = DMY_DATE_PATTERN.exec(trimmedValue);

  if (!dmyMatch) {
    return null;
  }

  return toIsoDateTime({
    day: Number(dmyMatch[1]),
    month: Number(dmyMatch[2]),
    year: Number(dmyMatch[3]),
  });
};

const roundDecimal = (value: number) => Math.round(value * 100) / 100;

const toIsoDateTime = ({
  day,
  month,
  year,
}: {
  readonly day: number;
  readonly month: number;
  readonly year: number;
}) => {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};
