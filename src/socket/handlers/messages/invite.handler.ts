import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { AppError } from "../../../errors/index.js";

export const inviteHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("invite", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const { destinationChatId, chatIds } = data;

      const messages = await messageService.sendInviteToChat(
        userId,
        destinationChatId,
        chatIds,
      );

      messages.map(async ({ message, chatId }) => {
        io.to(`chat:${chatId}`).emit("newMessage", {
          success: true,
          message,
        });
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        socket.emit("error", {
          message: error.message || "Failed to send message",
          code: error.code || "UNKNOWN_ERROR",
          statusCode: error.statusCode || 500,
        });
      } else {
        socket.emit("error", {
          message: "Failed to send invite",
        });
      }
    }
  });
};
