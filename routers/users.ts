import express, { Router, Request, Response } from "express";
import { createUser } from "../service/database/create-user";
import { ErrorMessages, HttpError, handleError } from "../service/errors";
import { findUsers } from "../service/database/find-users";
import { authenticateJWT } from "../middleware/jwt-auth";
import { isUser, isAdmin } from "../middleware/check-premissions";
const userRoutes: Router = express.Router();

userRoutes.get('', authenticateJWT, isUser, isAdmin, async (req: Request, res: Response) => {
    try {
        const newUser = await findUsers();
        return res.status(200).send(newUser);
    } catch (e) {
        return await handleError(e, res);
    }
});

export default userRoutes;