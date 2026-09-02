import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { getUniqueUserIdsFromRoom, getUserSockets } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";
import { z } from "zod";

const deleteChatSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
});

export const deleteChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("deleteChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;

      const validatedData = deleteChatSchema.parse(data);
      const { chatId } = validatedData;

      await chatService.deleteChat(chatId, userId); // ← поменял порядок

      const userIds = await getUniqueUserIdsFromRoom(io, chatId);

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
      handleSocketError(socket, error);
    }
  });
};
