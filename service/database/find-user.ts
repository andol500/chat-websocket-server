import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

export const findUser = async (username: string, includePassword: boolean = false) => {
    try {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                password: includePassword
            },
            where: {
                username: username
            }
        })
        await prisma.$disconnect();
        return user;
    } catch (e) {
        console.log(e);
        return null;
    }
}