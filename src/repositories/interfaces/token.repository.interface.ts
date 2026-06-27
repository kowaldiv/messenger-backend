export type CreateSessionInput = {
  userId: string;
  token: string;
  tokenType: "refresh" | "reset_password";
  fingerprint: string;
  expiresAt: Date;
};

export interface PublicTokenInfo {
  id: string;
  userId: string;
  fingerprint: string;
  createdAt: Date;
}

export interface TokenRepository {
  allSessions(userId: string): Promise<PublicTokenInfo[]>;
  createToken(data: CreateSessionInput): Promise<PublicTokenInfo>;
  isTokenValidByToken(token: string): Promise<PublicTokenInfo | null>;
  isTokenValidById(id: string): Promise<PublicTokenInfo | null>;
  deleteTokenByToken(token: string): Promise<void>;
  deleteTokenById(id: string, userId: string): Promise<void>;
}
