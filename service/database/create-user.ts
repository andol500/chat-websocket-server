import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();
export const createUser = async (data: User) => {
    try {
        const newUser = await prisma.user.create({
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
            },
            data: {
                username: data.username,
                name: data.name,
                password: data.password,
            }
        });
        await prisma.$disconnect();
        return newUser;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}