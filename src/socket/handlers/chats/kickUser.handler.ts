import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { AppError } from "../../../errors/index.js";
import { getUserSockets } from "../helpers.js";

export const kickUserHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("kickUser", async (data) => {
    try {
      const adminId = socket.data.currentUser.userId;
      const { chatId, targetUserId } = data;

      await chatService.kickUserFromChat(chatId, adminId, targetUserId);

      // Уведомляем всех участников чата об исключении
      io.to(`chat:${chatId}`).emit("chat:userLeft", {
        chatId,
        userId: targetUserId,
      });

      // Получаем все сокеты кикнутого пользователя
      const targetSockets = await getUserSockets(io, targetUserId);

      // Отключаем его от комнаты и уведомляем об удалении чата
      for (const targetSocket of targetSockets) {
        targetSocket.leave(`chat:${chatId}`);
        targetSocket.emit("chat:deleted", { chatId });
      }
    } catch (error) {
      console.error("Kick user error:", error);
      if (error instanceof AppError) {
        socket.emit("error", {
          message: error.message,
          code: error.code || "KICK_USER_FAILED",
          statusCode: error.statusCode || 500,
        });
      } else {
        socket.emit("error", {
          message: "Failed to kick user",
        });
      }
    }
  });
};
