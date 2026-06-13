import { PublicUser } from "../repositories/interface.js";

export interface AuthService {
  register(data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName?: string;
  }): Promise<{ user: PublicUser; token: string }>;
}
