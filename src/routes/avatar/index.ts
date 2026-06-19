import { type FastifyPluginAsync } from "fastify";
import { avatarRepository } from "../../repositories/avatar.repository.js";
import { avatarController } from "../../controllers/avatar.controller.js";
import { avatarService } from "../../service/avatar.service.js";
import { s3StorageService } from "../../service/implementations/storage.service.js";

const avatar: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log("✅ Avatar routes being registered!"); // ← Добавьте лог

  const avatarRepo = avatarRepository(fastify);
  const StorageService = s3StorageService();
  const service = avatarService(avatarRepo, StorageService);
  const controller = avatarController(service);

  // ---------- пользователи ------------

  fastify.post(
    "/uploadUserAvatar",
    { preHandler: [fastify.authenticate] },
    controller.uploadUserAvatar,
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
    controller.setPrimaryUserAvatar,
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
    controller.deleteUserAvatar,
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
    controller.uploadChatAvatar,
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
    controller.setPrimaryChatAvatar,
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
    controller.deleteChatAvatar,
  );
};

export default avatar;
