import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/index.js";
import {
  AuthRepository,
  TokenRepository,
  UserQueryRepository,
  UserRepository,
} from "../repositories/interface.js";
import bcrypt from "bcrypt";
import { AuthService } from "./interface.js";
import { FastifyInstance } from "fastify";
import { config } from "../config/index.js";

export function authService(
  userRepository: UserRepository,
  userQueryRepository: UserQueryRepository,
  tokenRepository: TokenRepository,
  authRepository: AuthRepository,
  instance: FastifyInstance,
): AuthService {
  const register = async ({
    email,
    password,
    username,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName?: string;
  }) => {
    // проверяем есть ли уже пользователи с таким email или username
    const exsistingEmail = await userRepository.existsByEmail(email);
    if (exsistingEmail) throw new ConflictError("EMAIL_ALREADY_EXISTS");
    const exsistingUsername = await userRepository.existsByUsername(username);
    if (exsistingUsername) throw new ConflictError("USERNAME_ALREADY_EXISTS");
    // создаем хеш пароля
    const passwordHash = await bcrypt.hash(password, 10);
    // создаем пользователя
    const user = await userRepository.create({
      email,
      passwordHash,
      username,
      firstName,
      lastName,
    });
    //создаем токены
    const accessToken = instance.jwt.sign(
      { userId: user.id },
      { expiresIn: `${config.ACCESS_TOKEN_EXPIRES_MIN}m` },
    );
    const refreshToken = instance.jwt.sign(
      { userId: user.id },
      { expiresIn: `${config.REFRESH_TOKEN_EXPIRES_DAYS}d` },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.REFRESH_TOKEN_EXPIRES_DAYS);
    await tokenRepository.createToken({
      userId: user.id,
      token: refreshToken,
      tokenType: "refresh",
      fingerprint: "",
      expiresAt,
    });
    // возвращаем токен и пользователя
    return { user, refreshToken, accessToken };
  };

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    // проверяем есть ли такой пользователь и правильный ли пароль
    const userWithCredentials =
      await authRepository.findByEmailWithCredentials(email);
    if (!userWithCredentials)
      throw new UnauthorizedError("INVALID_CREDENTIALS");
    const isValidPassword = await bcrypt.compare(
      password,
      userWithCredentials.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError("INVALID_CREDENTIALS");
    }
    // достаем информацию о пользователе
    const user = await userQueryRepository.findByIdWithAvatars(
      userWithCredentials.id,
    );
    if (!user) throw new Error("User not found after authentication");
    // создаем токены
    const accessToken = instance.jwt.sign(
      { userId: user.id },
      { expiresIn: `${config.ACCESS_TOKEN_EXPIRES_MIN}m` },
    );
    const refreshToken = instance.jwt.sign(
      { userId: userWithCredentials.id },
      { expiresIn: `${config.REFRESH_TOKEN_EXPIRES_DAYS}d` },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.REFRESH_TOKEN_EXPIRES_DAYS);
    await tokenRepository.createToken({
      userId: user.id,
      token: refreshToken,
      tokenType: "refresh",
      fingerprint: "",
      expiresAt,
    });
    // возвращаем пользователя и токен
    return { user, refreshToken, accessToken };
  };

  const forgotPassword = async (email: string) => {
    // находим пользователя
    const user = await userRepository.findByEmail(email);
    // если пользователя нет то выходим
    if (!user) return;
    // создаем токен и сохраняем
    const token = instance.jwt.sign(
      { userId: user?.id },
      { expiresIn: `${config.RESET_TOKEN_EXPIRES_HOURS}h` },
    );
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.RESET_TOKEN_EXPIRES_HOURS);
    const resetToken = await tokenRepository.createToken({
      userId: user.id,
      token,
      tokenType: "reset_password",
      fingerprint: "",
      expiresAt,
    });
    console.log(resetToken); // удалить потом
    // и отправляем пользователю на почту ссылку для востановления
    // const resetLink = `https://мой-сайт/reset-password/${token}`
    // await sendEmail()
  };

  const resetPassword = async ({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) => {
    // проверяем токен что существует
    const validToken = await tokenRepository.isTokenValidByToken(token);
    if (!validToken) throw new NotFoundError("LINK_IS_INCORRECT_OR_OUTDATED");
    // создаем хеш пароля и сохраняем
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(validToken.userId, passwordHash);
    // удаляем токен, он уже не нужен
    await tokenRepository.deleteTokenByToken(token);
  };

  const refreshToken = async (refreshToken: string) => {
    // проверяем токен что существует
    const validToken = await tokenRepository.isTokenValidByToken(refreshToken);
    if (!validToken) throw new UnauthorizedError("INVALID_REFRESH_TOKEN");
    // создаем access token и новый refresh token
    const accessToken = instance.jwt.sign({ userId: validToken.userId });
    const newRefreshToken = instance.jwt.sign({ userId: validToken.userId });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.REFRESH_TOKEN_EXPIRES_DAYS);
    await tokenRepository.createToken({
      userId: validToken.userId,
      token: newRefreshToken,
      tokenType: "refresh",
      fingerprint: "",
      expiresAt,
    });
    // удаляем старый токен
    await tokenRepository.deleteTokenByToken(refreshToken);
    // возвращаем токены
    return { accessToken, newRefreshToken };
  };

  const logout = async (refreshToken: string) => {
    // если токен есть то удаляем его
    const tokenInfo = await tokenRepository.isTokenValidByToken(refreshToken);
    if (tokenInfo) {
      await tokenRepository.deleteTokenByToken(refreshToken);
    }
  };

  const getSessions = async (userId: string) => {
    const sessions = await tokenRepository.allSessions(userId);
    return sessions;
  };

  const revokeSession = async (tokenId: string, userId: string) => {
    // если токен есть то удаляем его
    const tokenInfo = await tokenRepository.isTokenValidById(tokenId);
    if (tokenInfo) {
      await tokenRepository.deleteTokenById(tokenId, userId);
    }
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
