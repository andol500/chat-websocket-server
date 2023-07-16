import WebSocket from "ws";
import { JwtRequest, verifyToken } from "../middleware/jwt-auth";
import { findChat } from "./database/find-chat";
import { createMessage } from "./database/create-message";
import { Message } from "@prisma/client";

interface WebSocketClient extends WebSocket {
  chatId?: string;
  username?: string;
}

const connectedClients = new Set<WebSocketClient>();

const findClient = (chatId: string) =>
  Array.from(connectedClients).filter((client) => client.chatId === chatId);

export const websocket = async (ws: WebSocketClient, req: JwtRequest) => {
  try {
    const { chatId } = req.params;
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) throw new Error("No token provided");

    const decodedToken = verifyToken(token, req);

    if (!decodedToken) throw new Error("Invalid token");

    const chat = await findChat(parseInt(chatId), 1, 0);

    if (
      !chat ||
      !chat.users.some((user) => user.username === decodedToken.username)
    ) {
      ws.send("This is not your chat!");
      ws.close();
      return;
    }

    ws.chatId = chatId;
    ws.username = decodedToken.username;
    connectedClients.add(ws);

    ws.on("message", async (message: unknown) => {
      const revivedMessage = JSON.parse(message as string) as Message;

      const newMessage = await createMessage(
        decodedToken.username,
        parseInt(chatId),
        revivedMessage.content
      );

      if (newMessage) {
        const clients = findClient(chatId);
        clients.forEach((client) => {
          client.send(JSON.stringify(newMessage));
        });
      }
    });

    ws.on("close", () => {
      console.log(`WebSocket connection closed for chat ${chatId}`);
      connectedClients.delete(ws);
    });
  } catch (error) {
    ws.close();
  }
};
