/**
 * @file db.js
 * @description Initializes and exports single instance of Prisma Client ORM connection.
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Global Prisma Client instance for database query execution.
 * @type {PrismaClient}
 */
const prisma = new PrismaClient();

module.exports = prisma;

