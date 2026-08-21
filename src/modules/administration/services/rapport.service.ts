import createHttpError from "http-errors";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import rapportModel from "../models/rapport.model";
import analyseModel from "../models/analyse.model";

const parsePaginationAndSort = (query: any) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(query.limit as string) || 10)
  );

  const skip = (page - 1) * limit;

  const allowedSortFields = ["createdAt", "updatedAt", "titre"];

  const sortField = allowedSortFields.includes(query.sort as string)
    ? (query.sort as string)
    : "createdAt";

  const sortOrder = query.order === "asc" ? 1 : -1;

  const sortOptions: Record<string, 1 | -1> = {
    [sortField]: sortOrder,
  };

  return {
    page,
    limit,
    skip,
    sortOptions,
  };
};

export const generateReportFromAnalyse = async (
  analyseId: string,
  customData?: {
    titre?: string;
    description?: string;
  }
) => {
  const analyse = await analyseModel
    .findById(analyseId)
    .populate("donneesUtilisees");

  if (!analyse) {
    throw createHttpError(404, "Analyse introuvable");
  }

  const titre =
    customData?.titre ||
    `Rapport d'analyse - ${analyse.type} (${new Date().toLocaleDateString()})`;

  const description =
    customData?.description ||
    analyse.resultat ||
    `Rapport généré automatiquement à partir de l'analyse ${analyse._id}`;

  const statistiques = analyse.indicateurs || {};

  const rapport = new rapportModel({
    titre,
    description,
    analyseId: analyse._id,
    statistiques,
  });

  await rapport.save();

  return rapport.populate({
    path: "analyseId",
    populate: {
      path: "donneesUtilisees",
    },
  });
};

export const getReports = async (queryParams: any) => {
  const { page, limit, skip, sortOptions } =
    parsePaginationAndSort(queryParams);

  const [reports, total] = await Promise.all([
    rapportModel
      .find()
      .populate({
        path: "analyseId",
        populate: {
          path: "donneesUtilisees",
        },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),

    rapportModel.countDocuments(),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getReportById = async (id: string) => {
  const rapport = await rapportModel.findById(id).populate({
    path: "analyseId",
    populate: {
      path: "donneesUtilisees",
    },
  });

  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  return rapport;
};

export const deleteReport = async (id: string) => {
  const rapport = await rapportModel.findByIdAndDelete(id);

  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  return rapport;
};

export const generateReportPDF = async (reportId: string) => {
  const rapport = await rapportModel.findById(reportId).populate({
    path: "analyseId",
    populate: {
      path: "donneesUtilisees",
    },
  });

  if (!rapport) {
    throw createHttpError(404, "Rapport introuvable");
  }

  const analyse: any = rapport.analyseId;

  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 790;

  const titleColor = rgb(0.1, 0.2, 0.35);
  const textColor = rgb(0.2, 0.2, 0.2);

  // Titre principal
  page.drawText("CLEAN 237", {
    x: 50,
    y,
    size: 22,
    font: boldFont,
    color: titleColor,
  });

  y -= 35;

  page.drawText("RAPPORT ENVIRONNEMENTAL", {
    x: 50,
    y,
    size: 16,
    font: boldFont,
    color: titleColor,
  });

  y -= 35;

  // Titre du rapport
  page.drawText(rapport.titre || "Rapport sans titre", {
    x: 50,
    y,
    size: 13,
    font: boldFont,
    color: textColor,
  });

  y -= 25;

  // Date
  page.drawText(
    `Date de génération : ${new Date().toLocaleDateString()}`,
    {
      x: 50,
      y,
      size: 10,
      font,
      color: textColor,
    }
  );

  y -= 35;

  // Description
  page.drawText("Description / Résultat", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
    color: titleColor,
  });

  y -= 20;

  page.drawText(
    rapport.description || "Aucune description fournie.",
    {
      x: 50,
      y,
      size: 10,
      font,
      color: textColor,
      maxWidth: 495,
      lineHeight: 15,
    }
  );

  y -= 50;

  // Analyse associée
  if (analyse) {
    page.drawText("Analyse associée", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: titleColor,
    });

    y -= 22;

    page.drawText(
      `Type d'analyse : ${analyse.type || "Non renseigné"}`,
      {
        x: 50,
        y,
        size: 10,
        font,
        color: textColor,
      }
    );

    y -= 20;

    if (analyse.periode) {
      const startStr = new Date(
        analyse.periode.start
      ).toLocaleDateString();

      const endStr = new Date(
        analyse.periode.end
      ).toLocaleDateString();

      page.drawText(
        `Période : Du ${startStr} au ${endStr}`,
        {
          x: 50,
          y,
          size: 10,
          font,
          color: textColor,
        }
      );

      y -= 25;
    }

    // Statistiques
    if (analyse.indicateurs) {
      page.drawText("Statistiques et indicateurs", {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: titleColor,
      });

      y -= 25;

      for (const [key, value] of Object.entries(
        analyse.indicateurs
      )) {
        page.drawText(`${key} : ${String(value)}`, {
          x: 60,
          y,
          size: 10,
          font,
          color: textColor,
        });

        y -= 18;

        if (y < 60) {
          break;
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();

  return {
    pdfBytes,
    filename: `rapport-${rapport._id}.pdf`,
  };
};