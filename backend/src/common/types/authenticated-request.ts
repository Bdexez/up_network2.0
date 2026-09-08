import type { Request } from 'express';

/** Contenu du JWT émis par AuthService.signToken(). */
export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  companyId: number;
  roleId: number | null;
}

/** Ce que la stratégie JWT injecte dans `req.user`. */
export interface AuthenticatedUser {
  userId: number;
  email: string;
  username: string;
  /** Société active pour cette session (jamais fournie par le client). */
  companyId: number;
  roleId: number | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
