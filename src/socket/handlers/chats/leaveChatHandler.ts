import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

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

      socket.emit("chat:deleted", { chatId });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
