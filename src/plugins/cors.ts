import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(
  async (instance) => {
    await instance.register(cors, {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    });
  },
  {
    name: "cors",
  },
);
