import { Chat, PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

export const createChat = async (
  chat: Chat & { users: { username: string }[] }
) => {
  try {
    const newChat = await prisma.chat.create({
      select: {
        id: true,
        title: true,
        users: true,
      },
      data: {
        title: chat.title,
        users: {
          connect: chat.users.map((user) => ({ username: user.username })),
        },
      },
    });
    await prisma.$disconnect();
    return newChat;
  } catch (e) {
    console.log(e);
    return null;
  }
};
