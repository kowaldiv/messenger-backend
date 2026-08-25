import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

export const transferOwnershipHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("transferOwnership", async (data) => {
    try {
      const currentOwnerId = socket.data.currentUser.userId;
      const { chatId, newOwnerId } = data;

      await chatService.transferOwnership(chatId, currentOwnerId, newOwnerId);

      // Уведомляем всех участников чата о смене владельца
      io.to(`chat:${chatId}`).emit("chat:ownershipTransferred", {
        chatId,
        previousOwnerId: currentOwnerId,
        newOwnerId,
      });

      socket.emit("chat:transferOwnershipSuccess", { chatId, newOwnerId });
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
