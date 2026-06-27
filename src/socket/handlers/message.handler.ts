import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { MessageService } from "../../service/interfaces/message.service.interface.js";
import { AppError } from "../../errors/index.js";
import { joinUserToChat } from "./helpers.js";

export const messageHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
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
        await joinUserToChat(io, userId, chatId);
        await joinUserToChat(io, chatIdOrUserId, chatId);
      }

      io.to(`chat:${chatId}`).emit("newMessage", {
        success: true,
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
  });
  socket.on("invite", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const { destinationChatId, chatIds } = JSON.parse(data);

      const messages = await messageService.sendInviteToChat(
        userId,
        destinationChatId,
        chatIds,
      );

      messages.map(async ({ message, chatId, isNewChat, invitedUserId }) => {
        if (isNewChat) {
          await joinUserToChat(io, userId, chatId);
          if (invitedUserId) await joinUserToChat(io, invitedUserId, chatId);
        }
        io.to(`chat:${chatId}`).emit("newMessage", {
          success: true,
          message,
        });
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
