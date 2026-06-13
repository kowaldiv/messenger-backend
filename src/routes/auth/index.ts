import { type FastifyPluginAsync } from "fastify";
import { userRepository } from "../../repositories/user.repository.js";
import { authController } from "../../controllers/auth.js";
import { authService } from "../../service/auth.service.js";

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log("✅ User routes being registered!"); // ← Добавьте лог

  const userRepo = userRepository(fastify);
  const service = authService(userRepo);
  const controller = authController(service);

  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            username: { type: "string", minLength: 3 },
            firstName: { type: "string", minLength: 5 },
            lastName: { type: "string" },
          },
          required: ["email", "password", "username", "firstName"],
        },
      },
    },
    controller.register,
  );
};

export default auth;
