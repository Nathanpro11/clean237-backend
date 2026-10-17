import nodemailer from "nodemailer";

// Lecture paresseuse : dotenv.config() s'exécute après les imports dans app.ts
export const envoyerCodeReinitialisation = async (destinataire: string, nom: string, code: string) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "Clean237 <no-reply@clean237.cm>";

  if (!host || !user || !pass) {
    // Le code n'est affiché dans la console que si on le demande explicitement
    if (process.env.RESET_CODE_CONSOLE === "true") {
      console.warn(`[DEV] Code pour ${destinataire} : ${code}`);
      return;
    }
    throw new Error("Configuration e-mail manquante : définir SMTP_HOST, SMTP_USER et SMTP_PASS dans le .env");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: destinataire,
    subject: "Votre code de réinitialisation Clean237",
    text:
      `Bonjour ${nom},\n\n` +
      `Votre code de réinitialisation est : ${code}\n` +
      `Il est valable 15 minutes.\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.\n\n` +
      `L'équipe Clean237`,
  });

  console.log(`📧 Code de réinitialisation envoyé à ${destinataire}`);
};
//iwux uulv qucx qjau