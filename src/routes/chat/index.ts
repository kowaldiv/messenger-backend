import { FastifyPluginAsync } from "fastify";

const chat: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // ---------- пользователи ------------

  fastify.post(
    "/create",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          oneOf: [
            {
              type: "object",
              properties: {
                type: { const: "channel" },
                title: { type: "string", minLength: 1, maxLength: 50 },
                description: { type: "string", minLength: 1, maxLength: 300 },
                isPrivate: { type: "boolean" },
              },
              required: ["type", "title", "isPrivate"],
            },
            {
              type: "object",
              properties: {
                type: { const: "group" },
                title: { type: "string" },
              },
              required: ["type", "title"],
            },
          ],
        },
      },
    },
    fastify.controllers.chat.create,
  );
};

export default chat;
