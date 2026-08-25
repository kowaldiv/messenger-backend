import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { ChatService } from "../../../service/interfaces/chat.service.interface.js";
import { joinUserToChat, sendNewChatToUser } from "../helpers.js";
import { z } from "zod";
import { handleSocketError } from "../../utils/socketErrorHandler.js";

const createChatSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("group"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters")
      .trim(),
  }),
  z.object({
    type: z.literal("channel"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional()
      .default(""),
    isPrivate: z.boolean(),
  }),
]);

export const createChatHandler = (
  socket: Socket,
  io: SocketIOServer,
  chatService: ChatService,
) => {
  socket.on("createChat", async (data) => {
    try {
      const userId = socket.data.currentUser.userId;

      console.log(data);
      console.log(typeof data);
      const validatedData = createChatSchema.parse(data);

      if (validatedData.type === "channel") {
        const chat = await chatService.create({
          type: "channel",
          title: validatedData.title,
          isPrivate: validatedData.isPrivate,
          description: validatedData.description,
          creatorId: userId,
        });
        await sendNewChatToUser(io, userId, chat);
        await joinUserToChat(io, userId, chat.id);
      } else {
        const chat = await chatService.create({
          type: "group",
          title: validatedData.title,
          creatorId: userId,
        });
        await sendNewChatToUser(io, userId, chat);
        await joinUserToChat(io, userId, chat.id);
      }
    } catch (error) {
      handleSocketError(socket, error);
    }
  });
};
