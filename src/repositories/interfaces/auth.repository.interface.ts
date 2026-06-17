export type AuthUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  globalRole: string;
};

export interface AuthRepository {
  findByEmailWithCredentials(email: string): Promise<AuthUser | null>;
}
