import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

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
      handleSocketError(socket, error);
    }
  });
};
