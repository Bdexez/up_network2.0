import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../types/authenticated-request';

function extractUser(context: ExecutionContext): AuthenticatedUser {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.user) {
    throw new UnauthorizedException('Utilisateur non authentifié');
  }
  return request.user;
}

/** Injecte l'utilisateur authentifié (ou un de ses champs). */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const user = extractUser(context);
    return field ? user[field] : user;
  },
);

/**
 * Injecte l'id de la société active, lu depuis le JWT.
 * C'est la seule source de vérité pour le cloisonnement multi-société :
 * le client ne peut plus le choisir via un query param.
 */
export const CompanyId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const { companyId } = extractUser(context);
    if (!companyId) {
      throw new UnauthorizedException('Aucune société active sur ce compte');
    }
    return companyId;
  },
);
