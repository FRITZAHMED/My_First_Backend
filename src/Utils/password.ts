import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}

/**
 * Les refresh tokens sont stockes en base sous forme de SHA-256 :
 * une fuite de la base ne permet donc pas de rejouer une session.
 */
export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function createTokenId(): string {
	return randomUUID();
}
