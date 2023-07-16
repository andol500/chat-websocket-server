import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createMessage = async (username:string, chatId: number, content: string) => {
    try {
        const chats = await prisma.message.create({
            select: {
                author: {
                    select: {
                        username: true,
                        name: true,
                        role: true,
                    }
                },
                timestamp: true,
                content: true,
            }, 
            data: {
                content: content,
                chat: {
                    connect: {
                        id: chatId
                    }
                },
                author : {
                    connect: {
                        username: username
                    }
                }
            }
        })
        await prisma.$disconnect();
        return chats;
    } catch (e) {
        console.log(e);
        return [];
    }
}