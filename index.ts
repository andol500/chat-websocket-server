import express, { Express } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routers/users';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import YAML from 'yamljs';
import loginRoutes from './routers/sessions';
import chatRoutes from './routers/chats';
import cookieParser from 'cookie-parser';
import { JwtRequest, verifyToken } from './middleware/jwt-auth';
import expressWs from 'express-ws';
import WebSocket from 'ws';
import { Message } from '@prisma/client';
import { createMessage } from './service/database/create-message';
import { findChat } from './service/database/find-chat';
import { websocket } from './service/websocket';


dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000 ;
const swaggerDocument = YAML.load('open-api.yml');


app.use(express.json());
app.use(cors())
app.use(cookieParser());
app.set("port", port);

app.use("/", loginRoutes );
app.use("/users", userRoutes );
app.use("/chats", chatRoutes );

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
const appWs = expressWs(app);
appWs.app.ws('/chats/:chatId/websocket', websocket);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});