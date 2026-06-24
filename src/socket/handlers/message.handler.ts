import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../service/interfaces/chat.service.interface.js";
import { MessageService } from "../../service/interfaces/message.service.interface.js";
import { AppError } from "../../errors/index.js";

export const messageHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
  messageService: MessageService,
) => {
  // Функция для подключения пользователя по userId
  const joinUserToChat = async (userId: string, chatId: string) => {
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

  (socket.on("joinAllChats", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;

      const userChats = await chatService.getAllUserChats(userId);

      for (const chat of userChats) {
        await joinUserToChat(userId, chat.id);
      }

      socket.emit("joinedAllChats", {
        success: true,
        chats: userChats.map((chat) => chat.id),
        count: userChats.length,
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", {
        message: "Failed to join all chats",
      });
    }
  }),
    socket.on("sendMessage", async (data) => {
      try {
        const userId = socket.data.currentUser?.userId;
        const { chatIdOrUserId, text } = JSON.parse(data);

        const { message, chatId, isNewChat } = await messageService.create(
          userId,
          chatIdOrUserId,
          text,
        ); 

        if (isNewChat) {
          await joinUserToChat(userId, chatId);
          await joinUserToChat(chatIdOrUserId, chatId);
        }

        io.to(`chat:${chatId}`).emit("newMessage", {
          message,
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
            message: "Failed to send message",
          });
        }
      }
    }));
};
