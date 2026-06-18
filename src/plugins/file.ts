import fastifyMultipart from "@fastify/multipart";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    multipart: typeof fastifyMultipart;
  }
}

export default fp(
  async (instance) => {
    await instance.register(fastifyMultipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
        fieldSize: 10 * 1024 * 1024,
      },
      attachFieldsToBody: false,
    });

    instance.decorate("multipart", fastifyMultipart);
  },
  {
    name: "multipart",
  },
);
