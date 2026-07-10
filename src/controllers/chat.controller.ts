import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/index.js";
import { ChatService } from "../service/interfaces/chat.service.interface.js";

export function chatController(chatService: ChatService) {
  const updateLastReadMessageTime = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const userId = request.currentUser.userId;
      const { chatId } = request.params as { chatId: string };

      await chatService.updateLastReadMessageTime(userId, chatId);

      return reply.send({
        success: true,
        message: "Last read message time updated successfully",
      });
    } catch (error) {
      console.error("Update last read message time error", error);

      if (error instanceof AppError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "UPDATE_LAST_READ_TIME_FAILED",
      });
    }
  };

  return {
    updateLastReadMessageTime,
  };
}
