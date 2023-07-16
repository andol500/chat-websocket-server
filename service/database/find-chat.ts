import { Chat, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const findChat = async (chatId: number, messagesPage?: number, messagesPerPage?: number) => {
    try {
        const DEFAULT_PER_PAGE = 10;
        const currentPage = messagesPage || 1;
        const take = messagesPerPage || DEFAULT_PER_PAGE;
        const skip = (currentPage - 1) * take;
        const chats = await prisma.chat.findFirst({
            select: {
                id: true,
                title: true,
                users: true,
                messages: {
                    take,
                    skip,
                    orderBy: {
                        timestamp: 'desc'
                    }
                },
            }, 
            where: {
                id: chatId
            }
        })
        await prisma.$disconnect();
        return chats;
    } catch (e) {
        console.log(e);
        return null;
    }
}