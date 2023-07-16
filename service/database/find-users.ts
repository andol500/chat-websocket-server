import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

export const findUsers = async () => {
    try {
        const user = await prisma.user.findMany({
            select: {
                username: true,
                name: true,
                role: true,
            }
        })
        await prisma.$disconnect();
        return user;
    } catch (e) {
        console.log(e);
        return null;
    }
}