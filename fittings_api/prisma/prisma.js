const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaInstance() {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

module.exports = { getPrismaInstance };