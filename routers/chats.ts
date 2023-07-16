import express, { Router, Request, Response, NextFunction } from "express";
import { ErrorMessages, HttpError, handleError } from "../service/errors";
import { findChats } from "../service/database/find-chats";
import { JwtRequest, authenticateJWT } from "../middleware/jwt-auth";
import { findMessages } from "../service/database/find-messages";
import { createChat } from "../service/database/create-chat";
import { findChat } from "../service/database/find-chat";
import { createMessage } from "../service/database/create-message";
import { isUser } from "../middleware/check-premissions";
import { Chat } from "@prisma/client";
import { z } from "zod";

const chatRoutes: Router = express.Router();

const userSchema = z.object({
  username: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
});

const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: userSchema,
  timestamp: z.string(),
});

const chatSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  users: z.array(userSchema),
  messages: z.array(messageSchema).optional(),
  websocket: z.string().optional(),
});

chatRoutes.get(
  "",
  authenticateJWT,
  isUser,
  async (req: JwtRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string);
      const perPage = parseInt(req.query.per_page as string);
      const user = req.user;
      if (!user) {
        throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
      }

      const chats = await findChats(user.username, page, perPage);
      return res.status(200).send(chats);
    } catch (e) {
      return await handleError(e, res);
    }
  }
);

chatRoutes.post(
  "",
  authenticateJWT,
  isUser,
  async (req: JwtRequest, res: Response) => {
    try {
      let chat = req.body;
      const user = req.user;
      if (!user) {
        throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
      }
      chat.users.push({ username: user.username });
      const validatedChat = chatSchema.parse(chat);
      const newChat = await createChat(chat);
      return res.status(200).send(newChat)W;
    } catch (e) {
      return await handleError(e, res);
    }
  }
);

chatRoutes.get(
  "/:chatId",
  authenticateJWT,
  isUser,
  async (req: JwtRequest, res: Response) => {
    type ChatResponse = Chat & { websocket?: string };
    const websocketUrl = process.env.WEBSOCKET_URL || "ws://localhost:5000";
    try {
      const chatId = parseInt(req.params.chatId);
      const page = parseInt(req.query.page as string);
      const perPage = parseInt(req.query.per_page as string);
      const chat: ChatResponse | null = await findChat(chatId, page, perPage);
      if (!chat) {
        throw new HttpError(404, ErrorMessages.NOT_FOUND);
      }
      chat.websocket = `${websocketUrl}/chats/${chatId}/websocket`;
      return res.status(200).send(chat);
    } catch (e) {
      return await handleError(e, res);
    }
  }
);

chatRoutes.get(
  "/:chatId/messages",
  authenticateJWT,
  isUser,
  async (req: JwtRequest, res: Response) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const page = parseInt(req.query.page as string);
      const perPage = parseInt(req.query.per_page as string);
      const user = req.user;
      const chat = await findChat(chatId);

      console.log(user);

      if (
        !user ||
        !chat ||
        !chat.users.find((u) => u.username == user.username)
      ) {
        throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
      }
      const chats = await findMessages(chatId, page, perPage);
      return res.status(200).send(chats);
    } catch (e) {
      return await handleError(e, res);
    }
  }
);

chatRoutes.post(
  "/:chatId/messages",
  authenticateJWT,
  isUser,
  async (req: JwtRequest, res: Response) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const user = req.user;
      const chat = await findChat(chatId);
      if (
        !user ||
        !chat ||
        !chat.users.find((u) => u.username == user.username)
      ) {
        throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
      }
      const validatedMessage = messageSchema.parse(req.body);

      const chats = await createMessage(
        user.username,
        chatId,
        req.body.content
      );
      return res.status(200).send(chats);
    } catch (error) {
      return handleError(error, res);
    }
  }
);

export default chatRoutes;
