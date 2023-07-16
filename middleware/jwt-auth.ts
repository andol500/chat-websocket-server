import jwt, { JwtPayload } from 'jsonwebtoken';
import { HttpError, ErrorMessages, handleError } from '../service/errors';
import { NextFunction, Request as ExpressRequest, Response  } from 'express';

export interface UserPayload extends JwtPayload {
    username: string;
    role: string;
    exp: number;
}

export interface JwtRequest extends ExpressRequest {
    user?: UserPayload | null;
}
//Need an alternative method to verify token for websocket
export const verifyToken = (token: string, req: JwtRequest) => {
  if (!process.env.JWT_SECRET) {
    throw "JWT_SECRET not set";
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
  return decoded;
};


export const authenticateJWT = async (req: JwtRequest, res: Response, next: NextFunction) => {
    try {
      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new HttpError(500, ErrorMessages.INTERNAL_SERVER_ERROR);
      }
  
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
      }
  
      const token = authHeader.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;

      req.user = decodedToken;
      if (!decodedToken) {
        clearTokensAndThrowError(req, res);
      }
  
      const expireDate = decodedToken.exp * 1000;
      const fiveMinutes = 5 * 60 * 1000;
  
      if (expireDate - Date.now() < fiveMinutes) {
        const refreshToken = req.cookies['refreshToken'];
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as UserPayload;
  
        if (!decodedRefreshToken) {
          clearTokensAndThrowError(req, res);
        }
        
        //console.log(decodedRefreshToken);
        const newToken = generateToken(decodedRefreshToken);
        res.setHeader('Authorization', `Bearer ${newToken}`);
      }
  
      next();
    } catch (e) {
      return handleError(e, res);
    }
  };
  
  const clearTokensAndThrowError = (req: JwtRequest, res: Response) => {
    req.headers.authorization = undefined;
    req.cookies['refreshToken'] = undefined;
    throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
  };
  
  const generateToken = (payload: UserPayload): string => {
    return jwt.sign({ username: payload.username, role: payload.role }, process.env.JWT_SECRET as string, {
      expiresIn: '20m',
    });
  };
