import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { AppError } from "../../../errors/index.js";

export const sendMessageHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("sendMessage", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const { chatIdOrUserId, text } = data;

      const {
        message,
        chatId,
        isNewChat,
        fullChatForSender,
        fullChatForReceiver,
      } = await messageService.create(userId, chatIdOrUserId, text);
      // console.log(chat)

      if (isNewChat && fullChatForSender && fullChatForReceiver) {
        await sendNewChatToUser(io, userId, fullChatForSender);
        await sendNewChatToUser(io, chatIdOrUserId, fullChatForReceiver);
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
};
