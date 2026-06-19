// This creates a single instance of the Prisma Client that can be imported and used throughout the application. It also ensures that the Prisma Client is only instantiated once, which is important for performance and resource management.

import { PrismaClient } from '../generated/prisma/index.js'; // Importing the prisma database tool from the installed npm package 

const prisma = new PrismaClient(); // this creates a new instance of the Prisma Client and assigns it to the variable prisma

export default prisma; // this exports the prisma instance as the default export of the module, allowing it to be imported and used in other parts of the application