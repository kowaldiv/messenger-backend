import { FastifyPluginAsync } from "fastify";

const message: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    "/:chatId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            chatId: { type: "string" },
          },
          required: ["chatId"],
        },
        querystring: {
          type: "object",
          properties: {
            before: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.message.getMessages,
  );
};

export default message;
