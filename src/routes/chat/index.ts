import { FastifyPluginAsync } from "fastify";

const chat: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // ---------- чаты ------------

  // fastify.get(
  //   "/:chatId/participants",
  //   {
  //     preHandler: [fastify.authenticate],
  //     schema: {
  //       params: {
  //         type: "object",
  //         required: ["chatId"],
  //         properties: {
  //           chatId: { type: "string" },
  //         },
  //       },
  //     },
  //   },
  //   fastify.controllers.chat.getChatParticipants,
  // );

  // PUT /chats/:chatId/last-read - обновить время последнего прочтения
  fastify.put(
    "/:chatId/last-read",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["chatId"],
          properties: {
            chatId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.chat.updateLastReadMessageTime,
  );
};

export default chat;