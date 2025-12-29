import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

function getPrismaInstance(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

export { getPrismaInstance };