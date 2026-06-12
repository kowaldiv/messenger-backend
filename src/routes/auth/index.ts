import { type FastifyPluginAsync } from "fastify";

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log("✅ User routes being registered!"); // ← Добавьте лог
  fastify.post("/register", async function (request, reply) {
    return { root: true };
  });
};

export default auth;
