import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../service/interface.js";
import { UnauthorizedError } from "../errors/index.js";

export function authController(authService: AuthService) {
  const register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, username, firstName, lastName } =
      request.body as any;
    const { user, refreshToken, accessToken } = await authService.register({
      email,
      password,
      username,
      firstName,
      lastName,
    });
    reply.setCookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 1 * 60 * 60,
    });
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return reply.status(201).send({ user });
  };

  const login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as any;
    const { user, refreshToken, accessToken } = await authService.login({
      email,
      password,
    });
    reply.setCookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 1 * 60 * 60,
    });
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return reply.status(201).send({ user });
  };

  const forgotPassword = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { email } = request.body as any;
    await authService.forgotPassword(email);
    return reply.status(200).send();
  };

  const resetPassword = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { token, newPassword } = request.body as any;
    await authService.resetPassword({ token, newPassword });
    return reply.status(200).send();
  };

  const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedError("NO_REFRESH_TOKEN");
    const { accessToken, newRefreshToken } =
      await authService.refreshToken(refreshToken);
    reply.setCookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 1 * 60 * 60,
    });
    reply.setCookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  };

  const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) return reply.status(200).send();

    await authService.logout(refreshToken);

    reply.clearCookie("refresh_token", { path: "/" });
    reply.clearCookie("token", { path: "/" });
    return reply.status(200).send();
  };

  const getSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser.userId;
    const sessions = await authService.getSessions(userId);
    return sessions;
  };

  const revokeSession = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { tokenId } = request.body as any;
    const userId = request.currentUser.userId;

    await authService.revokeSession(tokenId, userId);

    return reply.status(200).send();
  };

  return {
    register,
    login,
    forgotPassword,
    resetPassword,
    refreshToken,
    logout,
    getSession,
    revokeSession,
  };
}
