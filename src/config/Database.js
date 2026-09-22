// const { PrismaClient } = require('@prisma/client');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

module.exports = prisma;

//Créer et configurer Prisma une fois, puis permettre à toute ton application de l'utiliser.