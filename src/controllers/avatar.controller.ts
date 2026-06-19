import { FastifyReply, FastifyRequest } from "fastify";
import { AvatarService } from "../service/interface.js";
import { AppError } from "../errors/index.js";

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
      return reply.status(201).send({
        success: true,
        data: avatar,
      });
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
      const { chatId } = request.params as any;

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
      return reply.status(201).send({
        success: true,
        data: avatar,
      });
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
    const { chatId } = request.params as any;
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

  return {
    uploadUserAvatar,
    setPrimaryUserAvatar,
    deleteUserAvatar,
    uploadChatAvatar,
    setPrimaryChatAvatar,
    deleteChatAvatar,
  };
}
