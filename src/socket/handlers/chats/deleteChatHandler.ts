import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { AppError } from "../../../errors/index.js";
import { getUserSockets } from "../helpers.js";

export const deleteChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("deleteChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;
      const { chatId } = data;

      await chatService.deleteChat(chatId, userId); // ← поменял порядок

      // Получаем все сокеты в комнате чата
      const socketsInRoom = await io.in(`chat:${chatId}`).fetchSockets();

      // Собираем уникальные userId участников
      const userIds = new Set(
        socketsInRoom
          .map((s) => s.data.currentUser?.userId)
          .filter((id): id is string => Boolean(id)),
      );

      // Для каждого пользователя находим ВСЕ его сокеты (все устройства)
      for (const participantId of userIds) {
        const userSockets = await getUserSockets(io, participantId);
        for (const s of userSockets) {
          s.leave(`chat:${chatId}`);
          s.emit("chat:deleted", { chatId });
        }
      }

      socket.emit("chat:deleteSuccess", { chatId });
    } catch (error) {
      console.error("Delete chat error:", error);
      if (error instanceof AppError) {
        socket.emit("error", {
          message: error.message,
          code: error.code || "DELETE_CHAT_FAILED",
          statusCode: error.statusCode || 500,
        });
      } else {
        socket.emit("error", {
          message: "Failed to delete chat",
        });
      }
    }
  });
};
