import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { joinUserToChat } from "../helpers.js";
import { AppError } from "../../../errors/index.js";

export const joinAllChatsHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("joinAllChats", async () => {
    try {
      const userId = socket.data.currentUser.userId;

      const userChats = await chatService.getAllUserChats(userId);

      for (const chat of userChats) {
        await joinUserToChat(io, userId, chat.id);
      }

      socket.emit("joinedAllChats", {
        success: true,
        chats: userChats,
        count: userChats.length,
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
  });
};
