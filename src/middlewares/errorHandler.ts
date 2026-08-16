
import type { Response, Request, NextFunction } from "express";
import { HttpError } from "http-errors";

export  const errorHandler = (err:HttpError, req:Request, res:Response, next:NextFunction)=>{
    res.status(err.status || 500).json({
        status:err.status || 500,
        message:err.message
    });
}