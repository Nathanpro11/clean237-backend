import type { NextFunction, Request, Response } from "express";
import BacAOrdureModel from "../models/bacAOrdure.model.js";
import { bacValidationSchema } from "../utils/validationSchema.js";
import createHttpError from "http-errors";

export const createBac = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const valideBac = await bacValidationSchema.validateAsync(req.body);
        const bac = new BacAOrdureModel(valideBac);
        await bac.save();
        return res.status(201).json({message: "Bac a ordure créé avec succès"});
    }
    catch(error: any){
        if(error.isJoi){
            return next({
                status: 422,
                message:error.details.map((err:any)=>err.message.replace(/"/g,""))
            });
        }
        next(error);
    }
}

export const getAllBacs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const bacs = await BacAOrdureModel.find().populate("zone");
        return res.status(200).json(bacs);
    }
    catch(error){
        next(error);
    }
}

export const getBacById = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const bac= await BacAOrdureModel.findById(req.params.idBac).populate("zone");
        if(!bac){
            throw createHttpError(404, "Bac a ordure non trouvé");
        }
        return res.status(200).json(bac);
    }
    catch(error){
        next(error);
    }
}

export const updateBac = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const valideBac = await bacValidationSchema.validateAsync(req.body);
        const bacModifie = await BacAOrdureModel.findByIdAndUpdate(req.params.idBac, valideBac);
        if(!bacModifie){
            throw createHttpError(404, "Bac a ordure non trouvé");
        }
        return res.status(202).json({message:"Bac a ordure modifié avec succès"});
    } 
    catch (error:any) {
       if(error.isJoi){
            return next({
                status:422,
                message:error.details.map((err:any)=>err.message.replace(/"/g,""))
            });
        }
        next(error); 
    }
}

export const deleteBac = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const bacSupprime = await BacAOrdureModel.findByIdAndDelete(req.params.idBac);
        if(!bacSupprime)
            throw createHttpError(404, "Bac a ordure non trouvé");
        return res.status(202).json({message: "Bac a ordure supprimé avec succès"});
    } catch (error) {
       next(error); 
    } 
}


