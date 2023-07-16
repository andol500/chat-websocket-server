This repo is a chat server to create and main listen to chatrooms with websocket.

Connect a database and add your secrets in .env file

example .env file

`PORT=5000
JWT_REFRESH_SECRET=secret
JWT_SECRET=secret
WEBSOCKET_URL = ws://localhost:5000
DATABASE_URL=postgres://postgres:postgresPW@localhost:5455/postgres?schema=public`

Initialize database:
`npx prisma migrate dev --name init`

To start on local machine
`npm run dev`

to open Open-Api go to after starting.
`http://localhost:5000/doc/`
