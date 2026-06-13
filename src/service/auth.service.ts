import { config } from "../config/index.js";
import { ConflictError } from "../errors/index.js";
import { UserRepository } from "../repositories/interface.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "./interface.js";

export function authService(userRepository: UserRepository): AuthService {
  const register = async (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName?: string;
  }) => {
    const { email, password, username, firstName, lastName } = data;
    const exsistingEmail = await userRepository.existsByEmail(email);
    if (exsistingEmail) {
      throw new ConflictError("EMAIL_ALREADY_EXISTS");
    }

    const exsistingUsername = await userRepository.existsByEmail(email);
    if (exsistingUsername) {
      throw new ConflictError("USERNAME_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      passwordHash,
      username,
      firstName,
      lastName,
    });

    const token = jwt.sign({ userId: user.id }, config.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    return { user, token };
  };
  
  return {
    register,
  };
}
