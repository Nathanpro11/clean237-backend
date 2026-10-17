import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { PDF_THEME } from "./pdfTheme";
import { drawRoundedRect, drawWrappedText, formatDateFr, formatNumber, sanitizeText } from "./pdfHelpers";

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const numeric = Number.parseInt(normalized, 16);
  return rgb(((numeric >> 16) & 255) / 255, ((numeric >> 8) & 255) / 255, (numeric & 255) / 255);
};

const resolveFonts = async (pdfDoc: PDFDocument) => {
  let regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  try {
    const loadFontkit = Function("return require")() as (id: string) => unknown;
    const fontkit = loadFontkit("@pdf-lib/fontkit");
    if (fontkit && typeof pdfDoc.registerFontkit === "function") {
      pdfDoc.registerFontkit(fontkit as never);
    }
    const regularPath = "assets/fonts/Poppins-Regular.ttf";
    const boldPath = "assets/fonts/Poppins-SemiBold.ttf";
    const fs = Function("return require")()("node:fs/promises") as {
      readFile: (path: string) => Promise<Uint8Array | null>;
    };
    const regularBuffer = await fs.readFile(regularPath).catch(() => null);
    const boldBuffer = await fs.readFile(boldPath).catch(() => null);

    if (regularBuffer && boldBuffer) {
      regularFont = await pdfDoc.embedFont(regularBuffer);
      boldFont = await pdfDoc.embedFont(boldBuffer);
    }
  } catch {
    regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  return { regularFont, boldFont };
};

export const buildReportPdf = async (pdfDoc: PDFDocument, rapport: any): Promise<Uint8Array> => {
  const { regularFont, boldFont } = await resolveFonts(pdfDoc);
  const pageWidth = PDF_THEME.page.width;
  const pageHeight = PDF_THEME.page.height;
  const margin = PDF_THEME.page.margin;

  const docTitle = sanitizeText(rapport?.titre || "Rapport environnemental");
  const docDescription = sanitizeText(rapport?.description || "Aucune description fournie.");
  const analysis = rapport?.analyseId;
  const indicators = analysis?.indicateurs || {};
  const indicatorEntries = Object.entries(indicators?.parType || {}) as Array<[string, { count: number; moyenne: number; minimum: number; maximum: number; somme: number; unite?: string }]>
  const generatedAt = new Date();

  const addFooter = (page: any, pageNumber: number, totalPages: number) => {
    const footerY = 18;
    page.drawLine({
      start: { x: margin, y: footerY + 10 },
      end: { x: pageWidth - margin, y: footerY + 10 },
      thickness: 1,
      color: hexToRgb(PDF_THEME.colors.border),
    });
    page.drawText("Clean237 · Administration", {
      x: margin,
      y: footerY,
      size: 8,
      font: regularFont,
      color: hexToRgb(PDF_THEME.colors.secondary),
    });
    page.drawText(`Page ${pageNumber} / ${totalPages}`, {
      x: pageWidth - margin - 70,
      y: footerY,
      size: 8,
      font: regularFont,
      color: hexToRgb(PDF_THEME.colors.secondary),
    });
  };

  const addHeader = (page: any, isFirstPage = false) => {
    if (isFirstPage) {
      page.drawRectangle({
        x: 0,
        y: pageHeight - 100,
        width: pageWidth,
        height: 100,
        color: hexToRgb(PDF_THEME.colors.primary),
      });
      page.drawText("CLEAN 237", {
        x: margin,
        y: pageHeight - 52,
        size: 24,
        font: boldFont,
        color: hexToRgb(PDF_THEME.colors.white),
      });
      page.drawText("Administration · Rapport environnemental", {
        x: margin,
        y: pageHeight - 72,
        size: 10,
        font: regularFont,
        color: hexToRgb(PDF_THEME.colors.light),
      });
      page.drawText(`Réf. ${String(rapport?._id || "").slice(-8)}`, {
        x: pageWidth - margin - 130,
        y: pageHeight - 52,
        size: 10,
        font: boldFont,
        color: hexToRgb(PDF_THEME.colors.white),
      });
      page.drawText(new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(generatedAt), {
        x: pageWidth - margin - 140,
        y: pageHeight - 72,
        size: 10,
        font: regularFont,
        color: hexToRgb(PDF_THEME.colors.white),
      });
      return;
    }

    page.drawLine({
      start: { x: margin, y: pageHeight - 18 },
      end: { x: pageWidth - margin, y: pageHeight - 18 },
      thickness: 1,
      color: hexToRgb(PDF_THEME.colors.primary),
    });
    page.drawText("CLEAN 237", {
      x: margin,
      y: pageHeight - 28,
      size: 11,
      font: boldFont,
      color: hexToRgb(PDF_THEME.colors.primary),
    });
  };

  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  addHeader(page, true);

  let cursorY = pageHeight - 120;

  page.drawRectangle({
    x: margin,
    y: cursorY - 45,
    width: 4,
    height: 38,
    color: hexToRgb(PDF_THEME.colors.primary),
  });
  page.drawText(docTitle, {
    x: margin + 16,
    y: cursorY,
    size: 20,
    font: boldFont,
    color: hexToRgb(PDF_THEME.colors.text),
  });
  cursorY -= 28;
  page.drawText(`Généré le ${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(generatedAt)}`, {
    x: margin + 16,
    y: cursorY,
    size: 9,
    font: regularFont,
    color: hexToRgb(PDF_THEME.colors.secondary),
  });
  cursorY -= 38;

  const summaryCardWidth = (pageWidth - margin * 2 - 20) / 3;
  const cards = [
    { label: "Points de données", value: String(analysis?.indicateurs?.totalPoints ?? 0) },
    { label: "Types de données", value: String(Object.keys(analysis?.indicateurs?.parType || {}).length) },
    {
      label: "Période",
      value: String(Math.max(1, Math.round(((new Date(analysis?.periode?.end || generatedAt).getTime() - new Date(analysis?.periode?.start || generatedAt).getTime()) / 86400000) + 1))),
    },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (summaryCardWidth + 10);
    drawRoundedRect(page, x, cursorY - 70, summaryCardWidth, 64, 10, PDF_THEME.colors.light, PDF_THEME.colors.primary, 1);
    page.drawText(card.label, {
      x: x + 12,
      y: cursorY - 25,
      size: 8,
      font: regularFont,
      color: hexToRgb(PDF_THEME.colors.secondary),
    });
    page.drawText(card.value, {
      x: x + 12,
      y: cursorY - 48,
      size: 22,
      font: boldFont,
      color: hexToRgb(PDF_THEME.colors.dark),
    });
  });
  cursorY -= 120;

  page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: hexToRgb(PDF_THEME.colors.primary) });
  page.drawText("Description", {
    x: margin,
    y: cursorY - 18,
    size: 13,
    font: boldFont,
    color: hexToRgb(PDF_THEME.colors.dark),
  });
  cursorY -= 28;
  const descriptionText = docDescription || "Aucune description fournie.";
  cursorY = drawWrappedText(page, descriptionText, margin, cursorY, regularFont, 10, 495, PDF_THEME.colors.text, 15) - 18;

  cursorY -= 18;
  page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: hexToRgb(PDF_THEME.colors.primary) });
  page.drawText("Analyse associée", {
    x: margin,
    y: cursorY - 18,
    size: 13,
    font: boldFont,
    color: hexToRgb(PDF_THEME.colors.dark),
  });
  cursorY -= 28;

  const keyValuePairs = [
    ["Type d'analyse", analysis?.type || "-"],
    ["Période du/au", `${analysis?.periode?.start ? new Date(analysis.periode.start).toLocaleDateString("fr-FR") : "-"} / ${analysis?.periode?.end ? new Date(analysis.periode.end).toLocaleDateString("fr-FR") : "-"}`],
    ["Date de l'analyse", analysis?.createdAt ? new Date(analysis.createdAt).toLocaleDateString("fr-FR") : "-"],
    ["Points analysés", String(analysis?.indicateurs?.totalPoints ?? 0)],
  ];

  const pairWidth = (pageWidth - margin * 2 - 45) / 2;
  keyValuePairs.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (pairWidth + 20);
    const yPos = cursorY - row * 42;
    page.drawRectangle({ x, y: yPos - 28, width: pairWidth, height: 32, color: hexToRgb(PDF_THEME.colors.section), borderColor: hexToRgb(PDF_THEME.colors.border), borderWidth: 1 });
    page.drawText(label, { x: x + 10, y: yPos - 12, size: 8, font: regularFont, color: hexToRgb(PDF_THEME.colors.secondary) });
    page.drawText(String(value), { x: x + 10, y: yPos - 26, size: 10, font: boldFont, color: hexToRgb(PDF_THEME.colors.text) });
  });

  cursorY -= 90;
  page.drawRectangle({ x: margin, y: cursorY - 70, width: pageWidth - margin * 2, height: 64, color: hexToRgb(PDF_THEME.colors.section), borderColor: hexToRgb(PDF_THEME.colors.border), borderWidth: 1 });
  page.drawRectangle({ x: margin, y: cursorY - 70, width: 4, height: 64, color: hexToRgb(PDF_THEME.colors.primary) });
  page.drawText("Résultat", { x: margin + 16, y: cursorY - 18, size: 10, font: boldFont, color: hexToRgb(PDF_THEME.colors.dark) });
  const resultText = sanitizeText(analysis?.resultat || "Aucun résultat disponible.");
  page.drawText(resultText.length > 100 ? `${resultText.substring(0, 100)}...` : resultText, { x: margin + 16, y: cursorY - 38, size: 10, font: regularFont, color: hexToRgb(PDF_THEME.colors.text), maxWidth: pageWidth - margin * 2 - 40 });
  cursorY -= 110;

  page.drawLine({ start: { x: margin, y: cursorY }, end: { x: pageWidth - margin, y: cursorY }, thickness: 1, color: hexToRgb(PDF_THEME.colors.primary) });
  page.drawText("Indicateurs par type de donnée", { x: margin, y: cursorY - 18, size: 13, font: boldFont, color: hexToRgb(PDF_THEME.colors.dark) });
  cursorY -= 28;

  if (indicatorEntries.length === 0) {
    page.drawRectangle({ x: margin, y: cursorY - 48, width: pageWidth - margin * 2, height: 44, color: hexToRgb(PDF_THEME.colors.section), borderColor: hexToRgb(PDF_THEME.colors.border), borderWidth: 1 });
    page.drawText("Aucun indicateur disponible pour cette analyse", { x: margin + 16, y: cursorY - 25, size: 10, font: regularFont, color: hexToRgb(PDF_THEME.colors.secondary) });
    cursorY -= 80;
  } else {
    const tableWidth = pageWidth - margin * 2;
    const colWidths = [160, 90, 90, 90, 90, 70];
    const headers = ["Type", "Nb points", "Moyenne", "Minimum", "Maximum", "Unité"];
    let tableY = cursorY;

    page.drawRectangle({ x: margin, y: tableY - 24, width: tableWidth, height: 24, color: hexToRgb(PDF_THEME.colors.dark) });
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: margin + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0) + 8,
        y: tableY - 18,
        size: 9,
        font: boldFont,
        color: hexToRgb(PDF_THEME.colors.white),
      });
    });

    let rowIndex = 0;
    for (const [type, metrics] of indicatorEntries) {
      const rowY = tableY - 24 - (rowIndex + 1) * 22;
      const fillColor = rowIndex % 2 === 0 ? PDF_THEME.colors.light : PDF_THEME.colors.white;
      page.drawRectangle({ x: margin, y: rowY, width: tableWidth, height: 22, color: hexToRgb(fillColor), borderColor: hexToRgb(PDF_THEME.colors.border), borderWidth: 1 });
      const label = String(type).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
      page.drawText(label, { x: margin + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      page.drawText(String(metrics?.count ?? 0), { x: margin + colWidths[0] + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      page.drawText(formatNumber(metrics?.moyenne ?? 0), { x: margin + colWidths[0] + colWidths[1] + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      page.drawText(formatNumber(metrics?.minimum ?? 0), { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      page.drawText(formatNumber(metrics?.maximum ?? 0), { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      page.drawText(String(metrics?.unite ?? "-"), { x: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 8, y: rowY + 7, size: 9, font: regularFont, color: hexToRgb(PDF_THEME.colors.text) });
      rowIndex += 1;
    }
    cursorY = tableY - 24 - rowIndex * 22 - 30;
  }

  const totalPages = 1;
  addFooter(page, 1, totalPages);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
