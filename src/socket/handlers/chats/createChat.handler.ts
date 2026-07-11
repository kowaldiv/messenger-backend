import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { AppError } from "../../../errors/index.js";

export const createChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("createChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;
      const { type, title, description, isPrivate } = data;

      if (type === "channel") {
        const chat = await chatService.create({
          type: "channel",
          title: title,
          isPrivate: isPrivate,
          description: description,
          creatorId: userId,
        });
        await sendNewChatToUser(io, userId, chat);
        await joinUserToChat(io, userId, chat.id);
      } else {
        const chat = await chatService.create({
          type: "group",
          title: title,
          creatorId: userId,
        });
        await sendNewChatToUser(io, userId, chat);
        await joinUserToChat(io, userId, chat.id);
      }
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
