// handlers/updateLastSeenHandler.ts
import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { UserService } from "../../../service/interfaces/user.service.interface.js";
import { getUserSockets } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

export const updateLastSeenHandler = (
  socket: Socket,
  io: SocketIOServer,
  userService: UserService,
) => {
  socket.on("updateLastSeen", async () => {
    try {
      const userId = socket.data.currentUser?.userId;

      // Обновляем lastSeen в базе данных
      const lastSeen = await userService.updateLastSeen(userId);

      // Получаем ВСЕ сокеты этого пользователя (все устройства)
      const userSockets = await getUserSockets(io, userId);

      // Обновляем lastSeen на всех устройствах пользователя
      for (const userSocket of userSockets) {
        userSocket.emit("user:lastSeenUpdated", {
          userId,
          lastSeen: lastSeen,
        });
      }

      // Получаем все комнаты, в которых состоит пользователь
      const rooms = Array.from(socket.rooms);
      const chatRooms = rooms.filter((room) => room.startsWith("chat:"));

      // Для каждой комнаты получаем участников и уведомляем их
      for (const chatRoom of chatRooms) {
        // Получаем всех участников чата
        const socketsInRoom = await io.in(chatRoom).fetchSockets();

        // Собираем уникальные userId участников (кроме самого пользователя)
        const participantIds = new Set(
          socketsInRoom
            .map((s) => s.data.currentUser?.userId)
            .filter((id): id is string => Boolean(id) && id !== userId),
        );

        // Для каждого участника отправляем обновление
        for (const participantId of participantIds) {
          const participantSockets = await getUserSockets(io, participantId);
          for (const participantSocket of participantSockets) {
            participantSocket.emit("user:lastSeenUpdated", {
              userId,
              lastSeen: lastSeen,
            });
          }
        }
      }
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
