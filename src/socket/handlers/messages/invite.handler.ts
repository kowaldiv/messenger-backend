import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { MessageService } from "../../../service/interfaces/message.service.interface.js";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

const inviteSchema = z.object({
  destinationChatId: z.string().min(1, "DestinationChatId is required").trim(),
  chatIds: z
    .array(z.string().min(1, "ChatId is required").trim())
    .min(1, "At least one chatId is required"),
});

export const inviteHandler = (
  socket: Socket,
  io: SocketIOServer,
  messageService: MessageService,
) => {
  socket.on("invite", async (data) => {
    try {
      const userId = socket.data.currentUser?.userId;
      const validatedData = inviteSchema.parse(data);
      const { destinationChatId, chatIds } = validatedData;

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
