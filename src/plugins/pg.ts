// import fp from "fastify-plugin";

// import { PrismaClient } from "../generated/prisma/client.js";
// import { PrismaPg } from "@prisma/adapter-pg";

// declare module "fastify" {
//   interface FastifyInstance {
//     pg: PrismaClient;
//   }
// }

// export default fp(
//   async (instance) => {
//     instance.decorate(
//       "prisma",
//       new PrismaClient({
//         adapter: new PrismaPg({
//           connectionString: instance.config.DATABASE_URL,
//         }),
//       }),
//     );
//   },
//   { name: "prisma" },
// );
