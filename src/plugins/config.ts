import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

const schema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    DATABASE_URL: { type: "string" },
  },
};

export default fp(async (instance) => {
  await instance.register(fastifyEnv, { schema });
});

// types/fastify.d.ts
declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
    };
  }
}
