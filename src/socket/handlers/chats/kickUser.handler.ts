import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { getUserSockets } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

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
      handleSocketError(socket, error);
    }
  });
};
