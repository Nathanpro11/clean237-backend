import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const numeric = Number.parseInt(normalized, 16);
  return rgb(((numeric >> 16) & 255) / 255, ((numeric >> 8) & 255) / 255, (numeric & 255) / 255);
};

export const sanitizeText = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\u202F|\u00A0/g, " ")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
};

export const formatNumber = (value: number): string => Number.isFinite(value) ? value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0";

export const formatDateFr = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Douala",
  }).format(date);
};

export const drawWrappedText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  maxWidth: number,
  color: string,
  lineHeight = 14,
  maxLines?: number,
  alignment: "left" | "right" | "center" = "left"
): number => {
  const safeText = sanitizeText(text) || "";
  const words = safeText.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return y;
  }

  let currentY = y;
  let currentLine = "";
  let lineCount = 0;

  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && currentLine) {
      page.drawText(currentLine, {
        x,
        y: currentY,
        size,
        font,
        color: hexToRgb(color),
        lineHeight,
      });
      currentY -= lineHeight;
      lineCount += 1;
      currentLine = word;
      if (maxLines && lineCount >= maxLines) {
        break;
      }
    } else {
      currentLine = test;
    }
  }

  if (currentLine) {
    page.drawText(currentLine, {
      x,
      y: currentY,
      size,
      font,
      color: hexToRgb(color),
      lineHeight,
    });
  }

  return currentY - (currentLine ? lineHeight : 0);
};

export const drawRoundedRect = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string,
  strokeColor?: string,
  strokeWidth = 1
): void => {
  const path = [
    `M ${x + radius} ${y}`,
    `L ${x + width - radius} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + radius}`,
    `L ${x + width} ${y + height - radius}`,
    `Q ${x + width} ${y + height} ${x + width - radius} ${y + height}`,
    `L ${x + radius} ${y + height}`,
    `Q ${x} ${y + height} ${x} ${y + height - radius}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    "Z",
  ].join(" ");

  page.drawSvgPath(path, {
    color: hexToRgb(fillColor),
    borderColor: strokeColor ? hexToRgb(strokeColor) : undefined,
    borderWidth: strokeWidth,
  });
};
