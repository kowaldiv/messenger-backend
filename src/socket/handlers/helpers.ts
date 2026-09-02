import { Server as SocketIOServer } from "socket.io";
import { PublicChat } from "../../service/transformers/chat.transformer.js";

export const getUserSockets = async (io: SocketIOServer, userId: string) => {
  const sockets = await io.fetchSockets();
  const userSockets = sockets.filter(
    (socket) => socket.data.currentUser?.userId === userId,
  );
  return userSockets;
};

// Функция для подключения пользователя по userId
export const joinUserToChat = async (
  io: SocketIOServer,
  userId: string,
  chatId: string,
) => {
  // Находим все сокеты этого пользователя
  const userSockets = await getUserSockets(io, userId);

  // Подключаем каждый найденный сокет к комнате
  for (const socket of userSockets) {
    const roomName = `chat:${chatId}`;
    await socket.join(roomName);
    console.log(`User ${userId} joined room: ${roomName}`);
  }

  return userSockets.length;
};

export const sendNewChatToUser = async (
  io: SocketIOServer,
  userId: string,
  chat: PublicChat,
) => {
  // Получаем все сокеты этого пользователя
  const userSockets = await getUserSockets(io, userId);

  // Отправляем событие "chat:new" каждому сокету
  for (const socket of userSockets) {
    socket.emit("chat:new", { chat });
    console.log(
      `📩 Sent new chat "${chat.id}" to user ${userId} (socket: ${socket.id})`,
    );
  }

  return userSockets.length;
};

export const getUniqueUserIdsFromRoom = async (
  io: SocketIOServer,
  chatId: string,
): Promise<Set<string>> => {
  const socketsInRoom = await io.in(`chat:${chatId}`).fetchSockets();

  return new Set(
    socketsInRoom
      .map((s) => s.data.currentUser?.userId)
      .filter((id): id is string => Boolean(id)),
  );
};
