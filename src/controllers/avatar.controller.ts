import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/index.js";
import { AvatarService } from "../service/interfaces/avatar.service.interface.js";

export function avatarController(avatarService: AvatarService) {
  const uploadUserAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const userId = request.currentUser.userId;

      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          message: "FILE_IS_REQUIRED",
        });
      }

      const buffer = await data?.toBuffer();

      const avatar = await avatarService.uploadUserAvatar(userId, {
        file: {
          buffer,
          minetype: data.mimetype,
          size: data.file.bytesRead,
          filename: data.filename,
        },
      });
      return reply.status(201).send(avatar);
    } catch (error) {
      console.error("Upload avatar error", error);
      return reply.status(500).send({
        success: false,
        message: error instanceof AppError ? error.message : "UPLOAD_FAILED",
      });
    }
  };

  const setPrimaryUserAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { avatarId } = request.params as { avatarId: string };

    await avatarService.setPrimaryUserAvatar(userId, avatarId);
    return reply.status(200).send();
  };

  const deleteUserAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { avatarId } = request.params as { avatarId: string };

    await avatarService.deleteUserAvatar(userId, avatarId);
    return reply.status(200).send();
  };

  const uploadChatAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const userId = request.currentUser.userId;
      const { chatId } = request.params as { chatId: string };

      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          message: "FILE_IS_REQUIRED",
        });
      }

      const buffer = await data?.toBuffer();

      const avatar = await avatarService.uploadChatAvatar(userId, chatId, {
        file: {
          buffer,
          minetype: data.mimetype,
          size: data.file.bytesRead,
          filename: data.filename,
        },
      });
      return reply.status(201).send(avatar);
    } catch (error) {
      console.error("Upload avatar error", error);
      return reply.status(500).send({
        success: false,
        message: error instanceof AppError ? error.message : "UPLOAD_FAILED",
      });
    }
  };

  const setPrimaryChatAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { chatId } = request.params as { chatId: string };
    const { avatarId } = request.params as { avatarId: string };

    await avatarService.setPrimaryChatAvatar(userId, chatId, avatarId);
    return reply.status(200).send();
  };

  const deleteChatAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { chatId } = request.params as any;
    const { avatarId } = request.params as { avatarId: string };

    await avatarService.deleteChatAvatar(userId, chatId, avatarId);
    return reply.status(200).send();
  };

  const getAvatars = async (request: FastifyRequest, reply: FastifyReply) => {
    const { entityType, entityId } = request.params as {
      entityType: "user" | "chat";
      entityId: string;
    };

    const avatars = await avatarService.getAvatars(entityType, entityId);
    return reply.status(200).send(avatars);
  };

  return {
    uploadUserAvatar,
    setPrimaryUserAvatar,
    deleteUserAvatar,
    uploadChatAvatar,
    setPrimaryChatAvatar,
    deleteChatAvatar,
    getAvatars,
  };
}
