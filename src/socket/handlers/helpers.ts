import { Server as SocketIOServer } from "socket.io";

// Функция для подключения пользователя по userId
export const joinUserToChat = async (
  io: SocketIOServer,
  userId: string,
  chatId: string,
) => {
  // Находим все сокеты этого пользователя
  const sockets = await io.fetchSockets();
  const userSockets = sockets.filter(
    (socket) => socket.data.currentUser?.userId === userId,
  );

  // Подключаем каждый найденный сокет к комнате
  for (const socket of userSockets) {
    const roomName = `chat:${chatId}`;
    await socket.join(roomName);
    console.log(`User ${userId} joined room: ${roomName}`);
  }

  return userSockets.length;
};
