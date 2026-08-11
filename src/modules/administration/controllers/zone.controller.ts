import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import zoneModel from "../models/zone.model";
import { zoneValidation} from "../utils/validationSchemas";


// CREATE ZONE
export const createZone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validateZone = await zoneValidation.validateAsync(req.body);

        const zone = new zoneModel(validateZone);

        await zone.save();

        return res.status(201).json({
            message: "Zone créée avec succès",
            zone
        });

    } catch (error: any) {
        if (error.isJoi) {
            return next(
                createHttpError(
                    422,
                    error.details.map((err: any) => err.message).join(", ")
                )
            );
        }

        return next(error);
    }
};


// GET ALL ZONES
export const getZones = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const zones = await zoneModel.find();

        return res.status(200).json({
            message: "Zones récupérées avec succès",
            zones
        });

    } catch (error: any) {
        return next(error);
    }
};


// GET ZONE BY ID
export const getZoneById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const zone = await zoneModel.findById(id);

        if (!zone) {
            return next(
                createHttpError(404, "Zone introuvable")
            );
        }

        return res.status(200).json({
            message: "Zone récupérée avec succès",
            zone
        });

    } catch (error: any) {
        return next(error);
    }
};


// UPDATE ZONE
export const updateZone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const validateZone = await zoneValidation.validateAsync(
            req.body
        );

        const zone = await zoneModel.findByIdAndUpdate(
            id,
            validateZone,
            {
                new: true,
                runValidators: true
            }
        );

        if (!zone) {
            return next(
                createHttpError(404, "Zone introuvable")
            );
        }

        return res.status(200).json({
            message: "Zone modifiée avec succès",
            zone
        });

    } catch (error: any) {
        if (error.isJoi) {
            return next(
                createHttpError(
                    422,
                    error.details.map((err: any) => err.message).join(", ")
                )
            );
        }

        return next(error);
    }
};


// DELETE ZONE
export const deleteZone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const zone = await zoneModel.findByIdAndDelete(id);

        if (!zone) {
            return next(
                createHttpError(404, "Zone introuvable")
            );
        }

        return res.status(200).json({
            message: "Zone supprimée avec succès"
        });

    } catch (error: any) {
        return next(error);
    }
};
