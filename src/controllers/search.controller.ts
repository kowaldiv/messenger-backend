import { FastifyReply, FastifyRequest } from "fastify";
import { SearchService } from "../service/interfaces/channel.setvice.interface.js";

export function searchController(searchService: SearchService) {
  const findByPattern = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { pattern } = request.body as { pattern: string };

    const result = await searchService.search(userId, pattern);

    return reply.status(200).send(result);
  };

  return {
    findByPattern,
  };
}
