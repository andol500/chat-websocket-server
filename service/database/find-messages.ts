import { Chat, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findMessages = async (chatId: number, page?: number , perPage?: number) => {
    try {
        const DEFAULT_PER_PAGE = 10;
        const currentPage = page || 1;
        const take = perPage || DEFAULT_PER_PAGE;
        const skip = (currentPage - 1) * take;

        const messages = await prisma.message.findMany({
            take,
            skip,
            orderBy: {
                timestamp: 'desc'
            },
            select: {
                id: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true,
                    }
                },
                content: true,
                timestamp: true,
                
            }, 
            where: {
                chatId: chatId,
            }
        })
        await prisma.$disconnect();
        return messages;
    } catch (e) {
        console.log(e);
        return [];
    }
}