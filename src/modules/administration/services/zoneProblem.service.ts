import createHttpError from "http-errors";
import DonneeModel from "../models/donneeEnvironnementale.model";

const getLevel = (score: number)=> {
    if(score >= 80) return "critique";
    if(score >= 60) return "problématique";
    if(score >= 40) return "à surveiller";
    return "normal";
};

const calculateAlertScore = (numberOfAlerts : number) => {
    return Math.min(numberOfAlerts * 10, 100);
};

export const detectProblematicZones = async () => {
    const donnees = await DonneeModel.find().sort({ date: 1 });

    if(!donnees.length){
        throw createHttpError(404, "Aucune donnée environnementale disponible pour détecter les zones problématiques.");
    }

    const zones: Record<string, any> = {};

    for(const donnee of donnees){
        const zoneId = donnee.zoneId?.toString();

        if(!zoneId) continue;   

        if(!zones[zoneId]){
            zones[zoneId] = {
                zoneId,
                alerts: 0,
            };
        }

        if (donnee.type === "alerte") {
            zones[zoneId].alerts += 1;  
        }
    }

    const results = Object.values(zones).map(zone => {  
        const alertScore = calculateAlertScore(zone.alerts);
        const score = alertScore;

        return {
            zoneId: zone.zoneId,
            score: Math.round(score),
            niveau: getLevel(score),
            details: {
                alertScore: Math.round(alertScore),
            }
        };
    });

    return results;
};


