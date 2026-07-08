import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/index.js";
import { ChatService } from "../service/interfaces/chat.service.interface.js";

export function chatController(chatService: ChatService) {
  // const getChatParticipants = async (
  //   request: FastifyRequest,
  //   reply: FastifyReply,
  // ) => {
  //   try {
  //     const userId = request.currentUser.userId;
  //     const { chatId } = request.params as { chatId: string };

  //     const participants = await chatService.getChatParticipants(
  //       chatId,
  //       userId,
  //     );

  //     return reply.send({
  //       success: true,
  //       data: participants,
  //     });
  //   } catch (error) {
  //     console.error("Get chat participants error", error);
  //     return reply.status(500).send({
  //       success: false,
  //       message:
  //         error instanceof AppError ? error.message : "GET_PARTICIPANTS_FAILED",
  //     });
  //   }
  // };

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
    // getChatParticipants,
    updateLastReadMessageTime,
  };
}
