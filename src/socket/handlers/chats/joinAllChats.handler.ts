import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { joinUserToChat } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

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
      handleSocketError(socket, error);
    }
  });
};
