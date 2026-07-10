import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { AppError } from "../../../errors/index.js";

export const leaveChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("leaveChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;
      const { chatId } = data;

      await chatService.leaveFromChat(userId, chatId);

      // Уведомляем остальных участников
      socket.to(`chat:${chatId}`).emit("chat:userLeft", { chatId, userId });

      // Отключаем пользователя от комнаты чата
      socket.leave(`chat:${chatId}`);

      socket.emit("chat:leaveSuccess", { chatId });
    } catch (error) {
      console.error("Leave chat error:", error);
      if (error instanceof AppError) {
        socket.emit("error", {
          message: error.message,
          code: error.code || "LEAVE_CHAT_FAILED",
          statusCode: error.statusCode || 500,
        });
      } else {
        socket.emit("error", {
          message: "Failed to leave chat",
        });
      }
    }
  });
};