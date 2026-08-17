import Log from "../models/log.model";

export const inscrireLogAction = async (idUser: string, action: string, description: string, req: any) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const nouveauLog = new Log({
      utilisateurId: idUser,
      action,
      description,
      ipAddress: String(ip)
    });
    await nouveauLog.save();
  } catch (error) {
    console.error("Impossible d'enregistrer le log d'audit :", error);
  }
};
