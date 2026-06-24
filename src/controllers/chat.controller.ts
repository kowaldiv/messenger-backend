import { FastifyReply, FastifyRequest } from "fastify";
import { ChatService } from "../service/interfaces/chat.service.interface.js";

type CreateChatBody =
  | { type: "channel"; title: string; description?: string; isPrivate: boolean }
  | { type: "group"; title: string };

export function chatController(chatService: ChatService) {
  const create = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser.userId;
    const body = request.body as CreateChatBody;

    if (body.type === "channel") {
      const chat = await chatService.create({
        creatorId: userId,
        type: body.type,
        title: body.title,
        description: body.description,
        isPrivate: body.isPrivate,
      });
      return reply.status(201).send(chat);
    } else {
      const chat = await chatService.create({
        creatorId: userId,
        type: body.type,
        title: body.title,
      });
      return reply.status(201).send(chat);
    }
  };

  return {
    create,
  };
}
