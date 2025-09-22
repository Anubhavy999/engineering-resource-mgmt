const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient across the entire app to avoid exhausting DB connections
let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma__) {
    global.__prisma__ = new PrismaClient();
  }
  prisma = global.__prisma__;
}

module.exports = prisma;


