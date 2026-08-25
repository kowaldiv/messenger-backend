import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

export const inviteHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("invite", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const { destinationChatId, chatIds } = data;

      const messages = await messageService.sendInviteToChat(
        userId,
        destinationChatId,
        chatIds,
      );

      messages.map(async ({ message, chatId }) => {
        io.to(`chat:${chatId}`).emit("newMessage", {
          success: true,
          message,
        });
      });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
