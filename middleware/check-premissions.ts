import { NextFunction, Response } from "express";
import { HttpError, ErrorMessages, handleError } from "../service/errors";
import { JwtRequest } from "./jwt-auth";

export const isUser = async (req: JwtRequest, res: Response, next: NextFunction) => {
    try{
        if (!req.user || !req.user.username) {
            throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
        }
      
        if (req.user.role != "USER" && req.user.role != "ADMIN") {
            throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
        }
      
        next();
    }catch(e){
        return await handleError(e, res);
    }
};
export const isAdmin = async (req: JwtRequest, res: Response, next: NextFunction) => {
    try{
        if (!req.user || !req.user.username) {
            throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
        }
      
        if (req.user.role != "ADMIN") {
            throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
        }
      
        next();
    }catch(e){
        return await handleError(e, res);
    }
   
};