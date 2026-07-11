import { type FastifyPluginAsync } from "fastify";

const avatar: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // ---------- пользователи ------------

  fastify.post(
    "/uploadUserAvatar",
    { preHandler: [fastify.authenticate] },
    fastify.controllers.avatar.uploadUserAvatar,
  );

  fastify.get(
    "/setPrimaryUserAvatar/:avatarId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["avatarId"],
          properties: {
            avatarId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.avatar.setPrimaryUserAvatar,
  );

  fastify.get(
    "/deleteUserAvatar/:avatarId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["avatarId"],
          properties: {
            avatarId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.avatar.deleteUserAvatar,
  );

  // ------------- чаты ----------------

  fastify.post(
    "/uploadChatAvatar/:chatId",
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
    fastify.controllers.avatar.uploadChatAvatar,
  );

  fastify.get(
    "/setPrimaryChatAvatar/:chatId/:avatarId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["chatId", "avatarId"],
          properties: {
            chatId: { type: "string" },
            avatarId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.avatar.setPrimaryChatAvatar,
  );

  fastify.get(
    "/deleteChatAvatar/:chatId/:avatarId",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["chatId", "avatarId"],
          properties: {
            chatId: { type: "string" },
            avatarId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.avatar.deleteChatAvatar,
  );

  fastify.get(
    "/:entityType/:entityId/avatars",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["entityType", "entityId"],
          properties: {
            entityType: {
              type: "string",
              enum: ["user", "chat"],
            },
            entityId: { type: "string" },
          },
        },
      },
    },
    fastify.controllers.avatar.getAvatars,
  );
};

export default avatar;
