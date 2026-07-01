import { FastifyPluginAsync } from "fastify";

const search: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["pattern"],
          properties: {
            pattern: { type: "string", minLength: 1 },
          },
        },
      },
    },
    fastify.controllers.search.findByPattern,
  );
};

export default search;
