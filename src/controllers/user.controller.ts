import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../service/interfaces/user.service.interface.js";

export function userController(userService: UserService) {
  const getUserInfo = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser.userId;

    const result = await userService.getUserInfo(userId);

    return reply.status(200).send(result);
  };

  const updateProfile = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const userId = request.currentUser.userId;
    const { username, firstName, lastName, bio } = request.body as {
      username: string;
      firstName: string;
      lastName: string;
      bio: string;
    };

    await userService.updateUserProfile({
      data: { username, firstName, lastName, bio },
      userId,
    });

    return reply.status(200).send();
  };

  // const updateLastSeen = async (
  //   request: FastifyRequest,
  //   reply: FastifyReply,
  // ) => {
  //   const userId = request.currentUser.userId;

  //   await userService.updateLastSeen(userId);

  //   return reply.status(200).send();
  // };

  return {
    getUserInfo,
    updateProfile,
    // updateLastSeen,
  };
}
