import { type FastifyPluginAsync } from "fastify";

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // ---------- пользователь ------------

  fastify.get(
    "/getInfo",
    { preHandler: [fastify.authenticate] },
    fastify.controllers.user.getUserInfo,
  );

  fastify.post(
    "/updateProfile",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            username: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            bio: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.user.updateProfile,
  );

  // fastify.post(
  //   "/updateLastSeen",
  //   { preHandler: [fastify.authenticate] },
  //   fastify.controllers.user.updateLastSeen,
  // );
};

export default user;
