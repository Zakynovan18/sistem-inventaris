require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

// Satu instance dipakai bersama seluruh aplikasi.
const prisma = new PrismaClient();

module.exports = prisma;