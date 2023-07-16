import express, { Router, Request, Response } from "express";
import { findUser } from "../service/database/find-user";
import { HttpError, ErrorMessages, handleError } from "../service/errors";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginRoutes: Router = express.Router();

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

loginRoutes.post("/sessions", async (req: Request, res: Response) => {
  try {
    const validateLogin = loginSchema.parse(req.body);
    const user = await findUser(req.body.username, true);
    if (!user) {
      throw new HttpError(401, ErrorMessages.INVALID_CREDENTIALS);
    }

    if (user.password !== req.body.password) {
      throw new HttpError(401, ErrorMessages.INVALID_CREDENTIALS);
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new HttpError(500, ErrorMessages.INTERNAL_SERVER_ERROR);
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET
    );
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      secure: true,
      maxAge: 1000 * 60 * 20,
    });
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).send({
      username: user.username,
      role: user.role,
      token: token,
    });
  } catch (e) {
    return await handleError(e, res);
  }
});

export default loginRoutes;
