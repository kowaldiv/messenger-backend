export type CreateSessionInput = {
  userId: string;
  token: string;
  tokenType: "refresh" | "reset_password";
  fingerprint: string;
  expiresAt: Date;
};

export interface Session {
  id: string;
  userId: string;
  fingerprint: string;
  createdAt: Date;
}

export interface TokenRepository {
  allSessions(userId: string): Promise<Session[]>;
  createToken(data: CreateSessionInput): Promise<Session>;
  isTokenValidByToken(token: string): Promise<Session | null>;
  isTokenValidById(id: string): Promise<Session | null>;
  deleteTokenByToken(token: string): Promise<void>;
  deleteTokenById(id: string, userId: string): Promise<void>;
}
