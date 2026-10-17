import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Utilisateur from "../models/utilisateur.model";
import Role from "../models/role.model";
import Log from "../models/log.model";

const debutDeJournee = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const compterActifsParRole = async (nomRole: string) => {
  const role = await Role.findOne({ nom: nomRole });
  return role ? Utilisateur.countDocuments({ roleId: role._id, estActif: true }) : 0;
};

// Avant-dernière connexion : la dernière est la session en cours.
const connexionPrecedente = async (userId: any) => {
  const [log] = await Log.find({ utilisateurId: userId, action: "CONNEXION" })
    .sort({ createdAt: -1 })
    .skip(1)
    .limit(1);
  return (log as any)?.createdAt ?? null;
};

// Statistiques RÉELLES calculées en base (comptes + journal d'audit).
// Les indicateurs liés aux signalements / collectes / missions n'existent pas encore :
// ils ne sont volontairement PAS renvoyés (plus de valeurs inventées).
export const getDashboardStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Utilisateur.findById(req.params.idUser).populate("roleId");
    if (!user || !user.estActif) throw createHttpError(404, "Utilisateur introuvable");

    const roleNom = String((user.roleId as any)?.nom ?? "citoyen").toLowerCase();
    const debutJour = debutDeJournee();
    let statistiques: Record<string, any>;

    if (roleNom === "admin") {
      const [totalComptes, comptesActifs, citoyensActifs, agentsActifs, connexionsAujourdhui, nouveauxInscrits7j] =
        await Promise.all([
          Utilisateur.countDocuments(),
          Utilisateur.countDocuments({ estActif: true }),
          compterActifsParRole("citoyen"),
          compterActifsParRole("agent"),
          Log.countDocuments({ action: "CONNEXION", createdAt: { $gte: debutJour } }),
          Utilisateur.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }),
        ]);

      statistiques = {
        vueAbonnement: "Vue globale administrative",
        Indicateurs: {
          totalComptes,
          comptesActifs,
          citoyensActifs,
          agentsActifs,
          connexionsAujourdhui,
          nouveauxInscrits7j,
        },
      };
    } else if (roleNom === "agent") {
      const [connexionsAujourdhui, actionsEnregistrees, precedente] = await Promise.all([
        Log.countDocuments({ utilisateurId: user._id, action: "CONNEXION", createdAt: { $gte: debutJour } }),
        Log.countDocuments({ utilisateurId: user._id }),
        connexionPrecedente(user._id),
      ]);

      statistiques = {
        vueAbonnement: "Espace terrain agent de collecte",
        Indicateurs: {
          zonePriseEnCharge: user.zoneAffectee ?? null,
          matricule: user.matricule ?? null,
          connexionsAujourdhui,
          actionsEnregistrees,
          connexionPrecedente: precedente,
        },
      };
    } else {
      const [actionsEnregistrees, precedente] = await Promise.all([
        Log.countDocuments({ utilisateurId: user._id }),
        connexionPrecedente(user._id),
      ]);

      statistiques = {
        vueAbonnement: "Portail citoyen standard",
        Indicateurs: {
          membreDepuis: (user as any).createdAt ?? null,
          connexionPrecedente: precedente,
          actionsEnregistrees,
        },
      };
    }

    return res.status(200).json({
      message: `Tableau de bord pour le profil [${roleNom}]`,
      proprietaire: user.nom,
      statistiques,
    });
  } catch (error) { next(error); }
};