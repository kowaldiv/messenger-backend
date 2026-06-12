import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../service/interface.js";

export function authController(userService: AuthService) {
  const register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, username, firstName, lastName } =
      request.body as any;

    try {
      const { user, token } = await userService.register({
        email,
        password,
        username,
        firstName,
        lastName,
      });

      return reply.status(201).send({ user, token });
    } catch (error) {}
  };

  return {
    register,
  };
}
