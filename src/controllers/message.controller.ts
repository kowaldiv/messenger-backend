import { FastifyReply, FastifyRequest } from "fastify";
import { MessageService } from "../service/interfaces/message.service.interface.js";

export function messageController(messageService: MessageService) {
  const getMessages = async (request: FastifyRequest, reply: FastifyReply) => {
    const { chatId } = request.params as { chatId: string };
    const { before } = request.query as { before?: string };

    const result = await messageService.getMessages({
      chatId,
      beforeId: before,
      limit: 30,
    });
    console.log(JSON.stringify(result, null, 1))
    return reply.status(200).send(result);
  };

  return {
    getMessages,
  };
}
