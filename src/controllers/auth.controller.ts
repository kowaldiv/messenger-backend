import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/index.js";
import { AuthService } from "../service/interfaces/auth.service.interface.js";
import { config } from "../config/index.js";
import { UAParser } from "ua-parser-js";

export function authController(authService: AuthService) {
  const register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, username, firstName, lastName } = request.body as {
      email: string;
      password: string;
      username: string;
      firstName: string;
      lastName: string;
    };

    const userAgent = request.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Формируем читаемый fingerprint
    const device =
      result.device.model || result.device.type || "Unknown Device";
    const browser = result.browser.name || "Unknown Browser";
    const os = result.os.name || "Unknown OS";

    const fingerprint = `${device} • ${browser} • ${os}`;

    const { user, refreshToken, accessToken } = await authService.register({
      email,
      password,
      username,
      firstName,
      lastName,
      fingerprint,
    });
    reply.setCookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * config.ACCESS_TOKEN_EXPIRES_MIN,
    });
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * 60 * 24 * config.REFRESH_TOKEN_EXPIRES_DAYS,
    });
    return reply.status(201).send(user);
  };

  const login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const userAgent = request.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Формируем читаемый fingerprint
    const device =
      result.device.model || result.device.type || "Unknown Device";
    const browser = result.browser.name || "Unknown Browser";
    const os = result.os.name || "Unknown OS";

    const fingerprint = `${device} • ${browser} • ${os}`;

    const { user, refreshToken, accessToken } = await authService.login({
      email,
      password,
      fingerprint,
    });
    reply.setCookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * config.ACCESS_TOKEN_EXPIRES_MIN,
    });
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * 60 * 24 * config.REFRESH_TOKEN_EXPIRES_DAYS,
    });
    return reply.status(200).send(user);
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
    const { token, newPassword } = request.body as {
      token: string;
      newPassword: string;
    };
    await authService.resetPassword({ token, newPassword });
    return reply.status(200).send();
  };

  const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedError("Сессия устарела! Вам нужно войти в акканут");

    const userAgent = request.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    // Формируем читаемый fingerprint
    const device =
      result.device.model || result.device.type || "Unknown Device";
    const browser = result.browser.name || "Unknown Browser";
    const os = result.os.name || "Unknown OS";

    const fingerprint = `${device} • ${browser} • ${os}`;

    const { accessToken, newRefreshToken } = await authService.refreshToken(
      refreshToken,
      fingerprint,
    );
    reply.setCookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * config.ACCESS_TOKEN_EXPIRES_MIN,
    });
    reply.setCookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      maxAge: 60 * 60 * 24 * config.REFRESH_TOKEN_EXPIRES_DAYS,
    });
  };

  const logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) return reply.status(200).send();

    await authService.logout(refreshToken);

    const clearOptions = {
      path: "/",
      secure: true,
      sameSite: "none" as const,
      partitioned: true,
    };

    reply.clearCookie("refresh_token", clearOptions);
    reply.clearCookie("access_token", clearOptions);

    return reply.status(200).send();
  };

  const getSessions = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser.userId;
    const sessions = await authService.getSessions(userId);
    return sessions;
  };

  const revokeSession = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { tokenId } = request.params as { tokenId: string };
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
    getSessions,
    revokeSession,
  };
}
